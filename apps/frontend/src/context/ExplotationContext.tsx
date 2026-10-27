import React, {createContext,useState,useContext,ReactNode,useCallback,} from "react";
import { api } from "../services/api";

// =========================================================
// INTERFAZ ACTIVITY
// =========================================================

export interface Activity {

  id?: string;
  plot: string;
  crop: string;
  activitytype: string;
  responsible: string;
  description: string;
  date_day: number;
  date_month: number;
  date_year: number;
  explotation: string;
}

// =========================================================
// CONTEXT
// =========================================================

interface ExplotationContextProps {

  explotations: any[];
  activities: Activity[];

  agregarActivity:
    (act: Activity) => Promise<void>;

  agregarExplotation:
    (ex: any) => Promise<any>;

  actualizarActivity:
    (
      id: string,
      act: Activity
    ) => Promise<void>;

  cargarExplotacionesByProducer:
    (
      producerId: string
    ) => Promise<any[]>;

  cargarExplotacionesByTechnician:
    () => Promise<any[]>;

  cargarActividades:
    () => Promise<void>;

  cargarActividadesByExplotation:
    (
      explotationId: string
    ) => Promise<Activity[]>;
}

// =========================================================
// CONTEXT
// =========================================================

const ExplotationContext =
  createContext<
    ExplotationContextProps | undefined
  >(undefined);

// =========================================================
// HOOK
// =========================================================

export const useExplotation = () => {

  const context =
    useContext(
      ExplotationContext
    );

  if (!context) {

    throw new Error(
      "useExplotation debe usarse dentro de ExplotationProvider"
    );

  }

  return context;
};

// =========================================================
// PROVIDER
// =========================================================

export const ExplotationProvider:
  React.FC<{
    children: ReactNode;
  }> = ({ children }) => {

  const [
    explotations,
    setExplotations
  ] = useState<any[]>([]);

  const [
    activities,
    setActivities
  ] = useState<Activity[]>([]);

  // =======================================================
  // CREAR EXPLOTACIÓN
  // =======================================================

  const agregarExplotation =
    useCallback(
      async (ex: any) => {

        try {

          const response =
            await api.createExplotation(
              ex
            );

          const nueva =
            response || ex;

          setExplotations(
            (prev) => [
              ...prev,
              nueva,
            ]
          );

          return nueva;

        } catch (error) {

          console.error(
            "Error en agregarExplotation:",
            error
          );

          throw error;
        }

      },
      []
    );

  // =======================================================
  // EXPLOTACIONES DEL PRODUCTOR
  // =======================================================
const cargarExplotacionesByProducer = useCallback(
  async (producerId: string) => {
    if (!producerId) {
      console.warn("No se recibió el ID del productor");
      return [];
    }

    try {
      console.log("1. Consultando productor:", producerId);

      const data = await api.getExplotationsByProducer(producerId);

      console.log("2. Respuesta original de la API:", data);

      if (!Array.isArray(data)) {
        console.error("La respuesta no es un array:", data);
        return [];
      }

      console.log("3. Explotaciones recibidas:", data.length);

      // Guardamos exactamente el array devuelto por la API.
      setExplotations(data);

      console.log("4. Se solicitó actualizar el contexto:", data);

      return data;
    } catch (error) {
      console.error("Error cargando explotaciones:", error);
      return [];
    }
  },
  []
);

  // =======================================================
  // EXPLOTACIONES DEL TÉCNICO
  // =======================================================

  const cargarExplotacionesByTechnician =
    useCallback(
      async () => {

        try {

          console.log(
            "Consultando explotaciones del técnico..."
          );

          const data =
            await api.getExplotationsByTechnician();

          console.log(
            "Explotaciones recibidas:",
            data
          );

          setExplotations(
            data || []
          );

          return data || [];

        } catch (error) {

          console.error(
            "Error al cargar explotaciones del técnico:",
            error
          );

          setExplotations([]);

          return [];
        }

      },
      []
    );

  // =======================================================
  // CARGAR TODAS LAS ACTIVIDADES DEL USUARIO
  // =======================================================

  const cargarActividades = useCallback(
  async () => {
    try {
      const userStr = localStorage.getItem("example_user");

      if (!userStr) {
        console.log("❌ No existe example_user");
        return;
      }

      const userData = JSON.parse(userStr);

      const userId = userData?.id;

      if (!userId) {
        return;
      }

      const data = await api.getActivities(userId);

      
      if (Array.isArray(data)) {
        data.forEach((act: any, index: number) => {
        });
      }

      const localesStr =
        localStorage.getItem(
          `local_activities_${userId}`
        );

      const actividadesLocales: Activity[] =
        localesStr
          ? JSON.parse(localesStr)
          : [];

      console.log(
        "Actividades locales:",
        actividadesLocales
      );

      let combinadas: Activity[] = [];

      if (
        Array.isArray(data) &&
        data.length > 0
      ) {
        combinadas = data.map(
          (act: any) => ({
            ...act,

            explotation:
              act.explotation ||
              act.exploitation ||
              act.exploitationId ||
              "",
          })
        );
      } else {

        combinadas = actividadesLocales;
      }


      setActivities(combinadas);

    } catch (error) {

      console.error(
        "❌ Error al cargar actividades:",
        error
      );

    }
  },
  []
);


  // =======================================================
  // ACTIVIDADES DE UNA EXPLOTACIÓN
  // =======================================================

  const cargarActividadesByExplotation =
  useCallback(
    async (
      explotationId: string
    ) => {

      if (!explotationId) {

        console.warn(
          "No se recibió explotationId"
        );

        setActivities([]);

        return [];
      }

      try {

        console.log(
          "================================"
        );

        console.log(
          "BUSCANDO ACTIVIDADES DE EXPLOTACIÓN"
        );

        console.log(
          "EXPLOTACIÓN:",
          explotationId
        );

        // =============================================
        // CONSULTAR ACTIVIDADES DE ESTA EXPLOTACIÓN
        // =============================================

        const data =
          await api.getActivitiesByExploitation(
            explotationId
          );

        console.log(
          "ACTIVIDADES RECIBIDAS DE LA API:",
          data
        );

        if (!Array.isArray(data)) {

          console.warn(
            "La API no devolvió un array"
          );

          setActivities([]);

          return [];
        }

        // =============================================
        // NORMALIZAR
        // =============================================

        const normalizadas: Activity[] =
          data.map(
            (act: any) => ({
              ...act,

              // La actividad viene del endpoint
              // de esta explotación, por lo tanto
              // sabemos a qué explotación pertenece.
              explotation:
                explotationId,
            })
          );

        console.log(
          "ACTIVIDADES DE LA EXPLOTACIÓN:",
          normalizadas
        );

        console.log(
          "================================"
        );

        setActivities(
          normalizadas
        );

        return normalizadas;

      } catch (error) {

        console.error(
          "Error al cargar actividades de la explotación:",
          error
        );

        setActivities([]);

        return [];
      }

    },
    []
  );

  // =======================================================
  // CREAR ACTIVIDAD
  // =======================================================

  const agregarActivity =
    useCallback(
      async (
        act: Activity
      ) => {

        try {

          const response =
            await api.createActivity(
              act
            );

          const nuevaAct =
            response || act;

          setActivities(
            (prev) => [
              nuevaAct,
              ...prev,
            ]
          );

        } catch (error) {

          console.error(
            "Error al guardar actividad:",
            error
          );

          setActivities(
            (prev) => [
              act,
              ...prev,
            ]
          );
        }

      },
      []
    );

  // =======================================================
  // ACTUALIZAR ACTIVIDAD
  // =======================================================

  const actualizarActivity =
    useCallback(
      async (
        id: string,
        act: Activity
      ) => {

        try {

          await api.updateActivity(
            id,
            act
          );

        } catch (error) {

          console.warn(
            "No se pudo actualizar en servidor:",
            error
          );

        }

        setActivities(
          (prev) =>
            prev.map(
              (a) =>
                a.id === id
                  ? {
                      ...act,
                      id,
                    }
                  : a
            )
        );

      },
      []
    );

  // =======================================================
  // PROVIDER
  // =======================================================

  return (

    <ExplotationContext.Provider
      value={{

        explotations,

        activities,

        agregarExplotation,

        agregarActivity,

        actualizarActivity,

        cargarExplotacionesByProducer,

        cargarExplotacionesByTechnician,

        cargarActividades,

        cargarActividadesByExplotation,

      }}
    >

      {children}

    </ExplotationContext.Provider>

  );
};