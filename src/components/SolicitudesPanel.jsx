import { useState } from "react";
import { useSolicitudes } from "../context/SolicitudesContext";

export default function SolicitudesPanel() {
    const { items, cargando, error, crear, resolver, eliminar } = useSolicitudes();
    const [descripcion, setDescripcion] = useState("");
    const [guardando, setGuardando] = useState(false);

    // Estado para el filtro del Reto de Aplicación: "TODAS", "PENDIENTES", "RESUELTAS"
    const [filtro, setFiltro] = useState("TODAS");

    const pendientes = items.filter((item) => item.estado === "PENDIENTE").length;

    // Derivación de la vista según el filtro seleccionado (sin hacer peticiones extra)
    const itemsFiltrados = items.filter((item) => {
        if (filtro === "PENDIENTES") return item.estado === "PENDIENTE";
        if (filtro === "RESUELTAS") return item.estado === "RESUELTA";
        return true; // TODAS
    });

    async function agregar(evento) {
        evento.preventDefault();
        if (!descripcion.trim() || guardando) return;
        setGuardando(true);
        try {
            const exito = await crear(descripcion.trim());
            if (exito) setDescripcion("");
        } finally {
            setGuardando(false);
        }
    }

    return (
        <main className="container py-4">
            <h1 className="mb-3">Gestión de solicitudes</h1>
            <p>Solicitudes pendientes: <strong>{pendientes}</strong></p>

            <form onSubmit={agregar} className="d-flex gap-2 mb-4">
                <input
                    className="form-control"
                    aria-label="Descripción de solicitud"
                    placeholder="Descripción de solicitud"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
                <button className="btn btn-primary" disabled={guardando || !descripcion.trim()}>
                    {guardando ? "Guardando..." : "Agregar"}
                </button>
            </form>

            {/* Selector de filtro (Reto de aplicación) */}
            <div className="btn-group mb-3" role="group" aria-label="Filtro de solicitudes">
                <button
                    type="button"
                    className={`btn ${filtro === "TODAS" ? "btn-secondary" : "btn-outline-secondary"}`}
                    onClick={() => setFiltro("TODAS")}>
                    Todas
                </button>
                <button
                    type="button"
                    className={`btn ${filtro === "PENDIENTES" ? "btn-secondary" : "btn-outline-secondary"}`}
                    onClick={() => setFiltro("PENDIENTES")}>
                    Mostrar pendientes
                </button>
                <button
                    type="button"
                    className={`btn ${filtro === "RESUELTAS" ? "btn-secondary" : "btn-outline-secondary"}`}
                    onClick={() => setFiltro("RESUELTAS")}>
                    Resueltas
                </button>
            </div>

            {cargando && <p role="status">Cargando solicitudes...</p>}
            {error && <div role="alert" className="alert alert-danger">{error}</div>}
            {!cargando && itemsFiltrados.length === 0 && <p>No hay solicitudes para este filtro.</p>}

            <ul className="list-group">
                {itemsFiltrados.map((item) => (
                    <li className="list-group-item d-flex justify-content-between align-items-center gap-2"
                        key={item.id}>
                        <span>{item.descripcion} — <strong>{item.estado}</strong></span>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-success btn-sm"
                                    disabled={item.estado === "RESUELTA"}
                                    onClick={() => resolver(item.id)}>Resolver</button>
                            <button className="btn btn-outline-danger btn-sm"
                                    onClick={() => eliminar(item.id)}>Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </main>
    );
}