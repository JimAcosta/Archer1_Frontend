import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useExplotation,
} from "../context/ExplotationContext";

import "../styles/ProducerHistory.css";

const TechnicalHistory: React.FC = () => {

  const {
    explotations = [],
    activities = [],
    cargarExplotacionesByTechnician,
    cargarActividadesByExplotation,
  } = useExplotation();

  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // ID RECIBIDO DESDE HOME TECNICO
  // =====================================================

  const idRecibido =
    (location.state as any)?.explotationId;

  // =====================================================
  // ESTADOS
  // =====================================================

  const [
    explotacionSeleccionada,
    setExplotacionSeleccionada,
  ] = useState<any>(null);

  const [
    filtroActividad,
    setFiltroActividad,
  ] = useState("");

  const [
    filtroParcela,
    setFiltroParcela,
  ] = useState("");

  const [
    fechaDesde,
    setFechaDesde,
  ] = useState("");

  const [cargando, setCargando] = useState(false);

  // =====================================================
  // CARGAR EXPLOTACIONES DEL TÉCNICO
  // =====================================================

  useEffect(() => {

    const cargarDatos = async () => {

      try {

        await cargarExplotacionesByTechnician();

      } catch (error) {

        console.error(
          "Error cargando explotaciones del técnico:",
          error
        );

      }

    };

    cargarDatos();

  }, [
    cargarExplotacionesByTechnician,
  ]);

  // =====================================================
  // SELECCIONAR EXPLOTACIÓN RECIBIDA
  // =====================================================

  useEffect(() => {

    if (!idRecibido) {
      console.warn(
        "No se recibió exploitationId desde la pantalla anterior"
      );
      return;
    }

    const encontrada =
      explotations.find(
        (ex: any) =>
          String(ex.id) === String(idRecibido)
      );

    console.log(
      "ID explotación recibido:",
      idRecibido
    );

    console.log(
      "Explotación encontrada:",
      encontrada
    );

    setExplotacionSeleccionada(
      encontrada || null
    );

  }, [
    idRecibido,
    explotations,
  ]);

  // =====================================================
  // CARGAR ACTIVIDADES DE LA EXPLOTACIÓN
  // =====================================================

  useEffect(() => {

    if (!idRecibido) {
      return;
    }

    const cargarHistorial = async () => {

      try {

        setCargando(true);

        console.log(
          "Consultando actividades de explotación:",
          idRecibido
        );

        await cargarActividadesByExplotation(
          idRecibido
        );

      } catch (error) {

        console.error(
          "Error cargando historial:",
          error
        );

      } finally {

        setCargando(false);

      }

    };

    cargarHistorial();

  }, [
    idRecibido,
    cargarActividadesByExplotation,
  ]);

  // =====================================================
  // CAMBIAR EXPLOTACIÓN DESDE EL SELECT
  // =====================================================

  const cambiarExplotacion = async (
    exploitationId: string
  ) => {

    if (!exploitationId) {

      setExplotacionSeleccionada(null);

      return;

    }

    const encontrada =
      explotations.find(
        (ex: any) =>
          String(ex.id) ===
          String(exploitationId)
      );

    setExplotacionSeleccionada(
      encontrada || null
    );

    // Limpiamos filtros
    setFiltroActividad("");
    setFiltroParcela("");
    setFechaDesde("");

    try {

      setCargando(true);

      console.log(
        "Consultando nueva explotación:",
        exploitationId
      );

      await cargarActividadesByExplotation(
        exploitationId
      );

    } catch (error) {

      console.error(
        "Error cargando actividades:",
        error
      );

    } finally {

      setCargando(false);

    }
  };

  // =====================================================
  // FILTRAR ACTIVIDADES
  // =====================================================

  const actividadesFiltradas =
    activities
      .filter((act: any) => {

        // -----------------------------------------------
        // FILTRO ACTIVIDAD
        // -----------------------------------------------

        if (
          filtroActividad &&
          String(act.activitytype) !==
            String(filtroActividad)
        ) {

          return false;

        }

        // -----------------------------------------------
        // FILTRO PARCELA
        // -----------------------------------------------

        if (
          filtroParcela &&
          String(act.plot) !==
            String(filtroParcela)
        ) {

          return false;

        }

        // -----------------------------------------------
        // FILTRO FECHA
        // -----------------------------------------------

        if (fechaDesde) {

          const [
            year,
            month,
            day,
          ] =
            fechaDesde
              .split("-")
              .map(Number);

          const fechaLimite =
            new Date(
              year,
              month - 1,
              day
            );

          const fechaActividad =
            new Date(
              Number(act.date_year),
              Number(act.date_month) - 1,
              Number(act.date_day)
            );

          if (
            fechaActividad <
            fechaLimite
          ) {

            return false;

          }

        }

        return true;

      })
      .sort((a: any, b: any) => {

        const fechaA =
          new Date(
            Number(a.date_year),
            Number(a.date_month) - 1,
            Number(a.date_day)
          ).getTime();

        const fechaB =
          new Date(
            Number(b.date_year),
            Number(b.date_month) - 1,
            Number(b.date_day)
          ).getTime();

        return fechaB - fechaA;

      });

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="page-background">

      <div className="history-frame">

        {/* =================================================
            NAVBAR
        ================================================== */}

        <div
          className="navbar"
          style={{
            backgroundColor: "#689028",
            color: "white",
            padding: "10px 15px",
          }}
        >

          <div className="navbar-left">

            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              Historial Técnico
            </h2>

          </div>

          {/* =================================================
              SELECT EXPLOTACIÓN
          ================================================== */}

          <select
            className="navbar-select-small"
            style={{
              minWidth: "200px",
              color: "#333",
            }}
            value={
              explotacionSeleccionada?.id || ""
            }
            onChange={(e) =>
              cambiarExplotacion(
                e.target.value
              )
            }
          >

            <option value="">
              Seleccionar explotación
            </option>

            {explotations.map(
              (ex: any) => (

                <option
                  key={ex.id}
                  value={ex.id}
                >
                  {ex.name ||
                    ex.nombre ||
                    ex.id}
                </option>

              )
            )}

          </select>

        </div>

        {/* =================================================
            CONTENIDO
        ================================================== */}

        <div className="history-content">

          {/* =================================================
              INFORMACIÓN
          ================================================== */}

          <div
            style={{
              padding: "15px",
              marginBottom: "20px",
              backgroundColor: "#eeeeee",
              color: "#222",
              borderRadius: "10px",
            }}
          >

            <p>

              <strong>
                Explotación:
              </strong>{" "}

              {explotacionSeleccionada?.name ||
                explotacionSeleccionada?.nombre ||
                "Sin nombre"}

            </p>

            <p>

              <strong>
                ID:
              </strong>{" "}

              {explotacionSeleccionada?.id ||
                idRecibido ||
                "No recibido"}

            </p>

            <p>

              <strong>
                Actividades recibidas:
              </strong>{" "}

              {activities.length}

            </p>

          </div>

          {/* =================================================
              FILTROS
          ================================================== */}

          <div
            style={{
              marginBottom: "25px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            {/* ACTIVIDAD */}

            <select
              className="navbar-select-small"
              style={{
                flex: 1,
              }}
              value={filtroActividad}
              onChange={(e) =>
                setFiltroActividad(
                  e.target.value
                )
              }
            >

              <option value="">
                Todas las actividades
              </option>

              {Array.from(
                new Set(
                  activities.map(
                    (act: any) =>
                      act.activitytype
                  )
                )
              )
                .filter(Boolean)
                .map(
                  (activityType: any) => (

                    <option
                      key={activityType}
                      value={activityType}
                    >
                      {activityType}
                    </option>

                  )
                )}

            </select>

            {/* PARCELA */}

            <select
              className="navbar-select-small"
              style={{
                flex: 1,
              }}
              value={filtroParcela}
              onChange={(e) =>
                setFiltroParcela(
                  e.target.value
                )
              }
            >

              <option value="">
                Todas las parcelas
              </option>

              {Array.from(
                new Set(
                  activities.map(
                    (act: any) =>
                      act.plot
                  )
                )
              )
                .filter(Boolean)
                .map(
                  (plot: any) => (

                    <option
                      key={plot}
                      value={plot}
                    >
                      {plot}
                    </option>

                  )
                )}

            </select>

            {/* FECHA */}

            <input
              type="date"
              className="navbar-select-small"
              style={{
                flex: 1,
              }}
              value={fechaDesde}
              onChange={(e) =>
                setFechaDesde(
                  e.target.value
                )
              }
            />

          </div>

          {/* =================================================
              HISTORIAL
          ================================================== */}

          <div className="cards-container">

            {cargando ? (

              <p
                style={{
                  textAlign: "center",
                  color: "#555",
                  marginTop: "30px",
                }}
              >
                Cargando historial...
              </p>

            ) : activities.length === 0 ? (

              <p
                style={{
                  textAlign: "center",
                  color: "#555",
                  marginTop: "30px",
                }}
              >
                No hay actividades registradas
                para esta explotación.
              </p>

            ) : actividadesFiltradas.length === 0 ? (

              <p
                style={{
                  textAlign: "center",
                  color: "#555",
                  marginTop: "30px",
                }}
              >
                Hay actividades, pero ninguna
                coincide con los filtros.
              </p>

            ) : (

              actividadesFiltradas.map(
                (
                  act: any,
                  index: number
                ) => (

                  <div
                    key={
                      act.id ||
                      index
                    }
                    className="activity-card"
                    style={{
                      color: "#222",
                    }}
                  >

                    {/* =====================================
                        CABECERA
                    ====================================== */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom:
                          "10px",
                      }}
                    >

                      <h3
                        className="card-activity-name"
                        style={{
                          color: "black",
                          margin: 0,
                          fontWeight:
                            "bold",
                        }}
                      >

                        {act.activitytype ||
                          "Actividad"}

                      </h3>

                      <span
                        className="card-date-label"
                      >

                        {act.date_day}/
                        {act.date_month}/
                        {act.date_year}

                      </span>

                    </div>

                    {/* =====================================
                        INFORMACIÓN
                    ====================================== */}

                    <div
                      className="card-body-data"
                    >

                      <p>
                        <strong>
                          ID actividad:
                        </strong>{" "}
                        {act.id ||
                          "N/A"}
                      </p>

                      <p>
                        <strong>
                          Parcela:
                        </strong>{" "}
                        {act.plot ||
                          "N/A"}
                      </p>

                      <p>
                        <strong>
                          Cultivo:
                        </strong>{" "}
                        {act.crop ||
                          "N/A"}
                      </p>

                      <p>
                        <strong>
                          Responsable:
                        </strong>{" "}
                        {act.responsible ||
                          "N/A"}
                      </p>

                      <p
                        style={{
                          marginTop:
                            "10px",
                          color:
                            "#444",
                        }}
                      >
                        {act.description ||
                          "Sin descripción"}
                      </p>

                    </div>

                    {/* =====================================
                        BOTÓN
                    ====================================== */}

                    <div
                      className="card-footer-actions"
                    >

                      <button
                        className="btn-edit-activity"
                        onClick={() =>
                          navigate(
                            `/nueva-observacion/${act.id}`
                          )
                        }
                        style={{
                          backgroundColor:
                            "white",
                          border:
                            "1px solid #689028",
                          color:
                            "#689028",
                        }}
                      >
                        Nueva Observación
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

      {/* =================================================
          VOLVER
      ================================================== */}

      <div className="bottom-container">

        <button
          className="back-link-main"
          onClick={() =>
            navigate(-1)
          }
        >
          Volver
        </button>

      </div>

    </div>

  );
};

export default TechnicalHistory;