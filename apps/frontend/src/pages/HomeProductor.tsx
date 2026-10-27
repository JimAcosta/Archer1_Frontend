import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useExplotation } from "../context/ExplotationContext";
import { useAuth } from "../hooks/useAuth";
import LogoutButton from "../components/LogoutButton";
import ActivityRegister from "./ActivityRegister";
import "../styles/HomeProductor.css";

export default function HomeProductor() {
  const { explotations, cargarExplotacionesByProducer } =
    useExplotation();

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [explotationSeleccionada, setExplotationSeleccionada] =
    useState<any>(null);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // =======================================================
  // CARGAR EXPLOTACIONES DEL PRODUCTOR
  // =======================================================

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (!user?.id) {
        console.log("Esperando identificación del usuario...");
        return;
      }

      console.log("Solicitando explotaciones para:", user.id);

      setCargando(true);
      setErrorCarga(false);

      try {
        const resultado =
          await cargarExplotacionesByProducer(user.id);

        console.log(
          "Resultado recibido por HomeProductor:",
          resultado
        );

        if (activo && !Array.isArray(resultado)) {
          console.error(
            "La respuesta de explotaciones no es un array:",
            resultado
          );
          setErrorCarga(true);
        }
      } catch (error) {
        console.error(
          "Error al cargar explotaciones en HomeProductor:",
          error
        );

        if (activo) {
          setErrorCarga(true);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [user?.id, cargarExplotacionesByProducer]);

  // =======================================================
  // FILTRAR EXPLOTACIONES DEL USUARIO
  // =======================================================

  const misExplotations = user?.id
    ? explotations.filter((ex: any) => {
        const producerId =
          typeof ex.producer === "object" && ex.producer !== null
            ? ex.producer.id
            : ex.producer ??
              ex.producer_id ??
              ex.producerId;

        return String(producerId) === String(user.id);
      })
    : [];
    
  useEffect(() => {
  
  }, [user, explotations]);

  // =======================================================
  // SELECCIONAR EXPLOTACIÓN RECIBIDA POR NAVEGACIÓN
  // =======================================================

  useEffect(() => {
    const idRecibido = (location.state as any)?.seleccionadaId;

    if (idRecibido == null) {
      return;
    }

    const encontrada = misExplotations.find(
      (ex: any) => String(ex.id) === String(idRecibido)
    );

    if (encontrada) {
      setExplotationSeleccionada(encontrada);

      // Limpiar el estado de navegación sin perder la URL actual.
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [
    misExplotations,
    location.state,
    location.pathname,
    navigate,
  ]);

  // =======================================================
  // CERRAR MENÚ AL HACER CLIC AFUERA
  // =======================================================

  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickAfuera);

    return () => {
      document.removeEventListener("mousedown", handleClickAfuera);
    };
  }, []);

  // =======================================================
  // ELEGIR EXPLOTACIÓN
  // =======================================================

  const handleSeleccionarExplotacion = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = event.target.value;

    const encontrada = misExplotations.find(
      (ex: any) => String(ex.id) === id
    );

    setExplotationSeleccionada(encontrada || null);
    setShowModal(false);
  };

  // =======================================================
  // CAMBIAR EXPLOTACIÓN
  // =======================================================

  const cambiarExplotacion = () => {
    setShowModal(false);
    setExplotationSeleccionada(null);
  };

  // =======================================================
  // RENDERIZADO
  // =======================================================

  return (
    <div className="page-background">
      <div className="producer-frame">
        <div className="home-container">
          <div className="navbar">
            <div className="nav-left">
              {explotationSeleccionada ? (
                <div className="explotacion-info">
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>{explotationSeleccionada.name}</span>
                </div>
              ) : (
                <span className="loading-text">
                  Seleccione una explotación
                </span>
              )}
            </div>

            <div className="nav-right" ref={menuRef}>
              <button
                type="button"
                className="user-profile-trigger"
                onClick={() => setMenuAbierto(!menuAbierto)}
                aria-label="Abrir menú de usuario"
              >
                <i className="bi bi-person-circle"></i>
              </button>

              {menuAbierto && (
                <div className="custom-dropdown">
                  <div className="dropdown-user-name">
                    {user?.name || user?.email || "Usuario"}
                  </div>

                  <div className="dropdown-divider"></div>

                  <LogoutButton className="logout-btn-style" />
                </div>
              )}
            </div>
          </div>

          <div className="main-content">
            {!explotationSeleccionada ? (
              <div className="selection-container">
                <i className="bi bi-geo-alt selection-icon"></i>

                <h2>Seleccioná una explotación</h2>

                <p>
                  Para continuar, primero elegí la explotación
                  con la que querés trabajar.
                </p>

                {cargando ? (
                  <p>Cargando explotaciones...</p>
                ) : errorCarga ? (
                  <div>
                    <p className="empty-explotations">
                      No se pudieron cargar las explotaciones.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        user?.id &&
                        cargarExplotacionesByProducer(user.id)
                      }
                    >
                      Reintentar
                    </button>
                  </div>
                ) : misExplotations.length > 0 ? (
                  <select
                    className="explotation-select"
                    value=""
                    onChange={handleSeleccionarExplotacion}
                  >
                    <option value="" disabled>
                      Elegir explotación...
                    </option>

                    {misExplotations.map((ex: any) => (
                      <option
                        key={ex.id}
                        value={String(ex.id)}
                      >
                        {ex.name || "Explotación sin nombre"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="empty-explotations">
                    {explotations.length > 0
                      ? "No se encontraron explotaciones asociadas a tu usuario."
                      : "No tenés explotaciones disponibles."}
                  </p>
                )}
              </div>
            ) : (
              <div className="actions-container">
                <div className="selected-explotation">
                  <i className="bi bi-check-circle-fill"></i>

                  <div>
                    <span>Explotación seleccionada</span>
                    <h2>{explotationSeleccionada.name}</h2>
                  </div>

                  <button
                    type="button"
                    className="change-explotation-btn"
                    onClick={cambiarExplotacion}
                  >
                    Cambiar
                  </button>
                </div>

                <div className="buttons">
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                  >
                    Registrar actividad
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/producer-history")}
                  >
                    Historial
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/generate-summary")}
                  >
                    Generar resumen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && explotationSeleccionada && (
        <ActivityRegister
          explotationId={explotationSeleccionada.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

  