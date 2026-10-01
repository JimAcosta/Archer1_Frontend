import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useExplotation } from "../context/ExplotationContext";
import LogoutButton from "../components/LogoutButton";

import "../styles/HomeProductor.css";

export default function HomeTecnic() {

  const { user } = useAuth();

  const {
    explotations,
    cargarExplotacionesByTechnician,
  } = useExplotation();

  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // CARGAR EXPLOTACIONES ASIGNADAS AL TÉCNICO
  // =====================================================

  useEffect(() => {

    cargarExplotacionesByTechnician();

  }, [
    cargarExplotacionesByTechnician
  ]);

  // =====================================================
  // MENÚ DEL USUARIO
  // =====================================================

  const toggleMenu = () => {
    setMenuAbierto((prev) => !prev);
  };

  useEffect(() => {

    const handleClickOutside = (
      e: MouseEvent
    ) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          e.target as Node
        )
      ) {

        setMenuAbierto(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  // =====================================================
  // IR AL HISTORIAL
  // =====================================================

  const irAlHistorial = (
    explotationId: string
  ) => {

    console.log(
      "ID explotación seleccionada:",
      explotationId
    );

    navigate(
      "/technical-history",
      {
        state: {
          explotationId,
        },
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="page-background">

      <div className="producer-frame">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <div className="navbar">

          <span
            style={{
              fontWeight: "bold",
              color: "white",
              fontSize: "25px",
            }}
          >
            Explotaciones asignadas
          </span>

          <div
            ref={menuRef}
            className="nav-right"
          >

            <div
              onClick={toggleMenu}
              className="user-profile-trigger"
            >

              <i className="bi bi-person-circle"></i>

            </div>

            {menuAbierto && (

              <div className="custom-dropdown">

                <div
                  className="dropdown-user-name"
                  style={{
                    padding: "10px",
                    borderBottom:
                      "1px solid #eee",
                    fontWeight: "bold",
                  }}
                >

                  {user?.email ||
                    "Usuario"}

                </div>

                <div
                  style={{
                    padding: "5px",
                  }}
                >

                  <LogoutButton />

                </div>

              </div>

            )}

          </div>

        </div>

        {/* =================================================
            LISTADO DE EXPLOTACIONES
        ================================================= */}

        <div
          style={{
            padding: "40px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              paddingRight: "5px",
            }}
          >

            {explotations.length === 0 ? (

              <div
                style={{
                  textAlign: "center",
                  color: "#A0A0A0",
                  marginTop: "50px",
                }}
              >
                No hay explotaciones asignadas.
              </div>

            ) : (

              explotations.map(
                (ex: any) => (

                  <div
                    key={ex.id}
                    style={{
                      backgroundColor:
                        "#99a877",
                      borderRadius: "25px",
                      padding:
                        "20px 30px",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      boxShadow:
                        "0 4px 15px rgba(0,0,0,0.1)",
                    }}
                  >

                    {/* =================================
                        INFORMACIÓN
                    ================================= */}

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: "4px",
                      }}
                    >

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "22px",
                          fontWeight: "900",
                          color: "#000",
                        }}
                      >

                        {ex.name ||
                          ex.nombre ||
                          "Sin nombre"}

                      </h3>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          color: "#222",
                          fontWeight: "600",
                        }}
                      >

                        Responsable:{" "}

                        {ex.producer ===
                        "invitado"
                          ? "Productor Invitado"
                          : ex.producer ||
                            "Sin responsable"}

                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "#444",
                        }}
                      >

                        <i className="bi bi-geo-alt"></i>{" "}

                        {ex.ubicacion ||
                          "Ubicación no disponible"}

                      </p>

                    </div>

                    {/* =================================
                        HISTORIAL
                    ================================= */}

                    <button
                      onClick={() =>
                        irAlHistorial(ex.id)
                      }
                      style={{
                        backgroundColor:
                          "#fdfaf2",
                        color: "#333",
                        border: "none",
                        padding:
                          "10px 25px",
                        borderRadius: "15px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "13px",
                        boxShadow:
                          "0 4px 10px rgba(0,0,0,0.15)",
                      }}
                    >
                      Historial
                    </button>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>

    </div>
  );
}