import { createContext, useContext, useEffect, useReducer } from "react";
import { solicitudesApi } from "../services/solicitudesApi";

const SolicitudesContext = createContext(null);

const inicial = { items: [], cargando: false, error: "" };

function reducer(estado, accion) {
    switch (accion.type) {
        case "CARGANDO":
            return { ...estado, cargando: true, error: "" };
        case "CARGADAS":
            return { ...estado, items: accion.payload, cargando: false };
        case "ERROR":
            return { ...estado, error: accion.payload, cargando: false };
        case "AGREGADA":
            return { ...estado, items: [...estado.items, accion.payload] };
        case "ACTUALIZADA":
            return {
                ...estado,
                items: estado.items.map((item) =>
                    item.id === accion.payload.id ? accion.payload : item
                )
            };
        case "ELIMINADA":
            return { ...estado, items: estado.items.filter((item) => item.id !== accion.payload) };
        default:
            return estado;
    }
}

function mensajeError(error) {
    return error.response?.data?.detail || error.message || "Error desconocido";
}

export function SolicitudesProvider({ children }) {
    const [estado, dispatch] = useReducer(reducer, inicial);

    useEffect(() => {
        const controlador = new AbortController();

        async function cargar() {
            dispatch({ type: "CARGANDO" });
            try {
                const respuesta = await solicitudesApi.listar(controlador.signal);
                if (!controlador.signal.aborted) {
                    dispatch({ type: "CARGADAS", payload: respuesta.data });
                }
            } catch (error) {
                if (!controlador.signal.aborted) {
                    dispatch({ type: "ERROR", payload: mensajeError(error) });
                }
            }
        }
        cargar();
        return () => controlador.abort();
    }, []);

    async function ejecutar(operacion, tipo, obtenerPayload) {
        dispatch({ type: "ERROR", payload: "" });
        try {
            const resultado = await operacion();
            dispatch({ type: tipo, payload: obtenerPayload(resultado) });
            return true;
        } catch (error) {
            dispatch({ type: "ERROR", payload: mensajeError(error) });
            return false;
        }
    }

    const crear = (descripcion) => ejecutar(
        () => solicitudesApi.crear(descripcion), "AGREGADA", (respuesta) => respuesta.data
    );
    const resolver = (id) => ejecutar(
        () => solicitudesApi.cambiarEstado(id, "RESUELTA"), "ACTUALIZADA", (respuesta) => respuesta.data
    );
    const eliminar = (id) => ejecutar(
        () => solicitudesApi.eliminar(id), "ELIMINADA", () => id
    );

    return (
        <SolicitudesContext.Provider value={{ ...estado, crear, resolver, eliminar }}>
            {children}
        </SolicitudesContext.Provider>
    );
}

export function useSolicitudes() {
    const contexto = useContext(SolicitudesContext);
    if (!contexto) {
        throw new Error("useSolicitudes requiere SolicitudesProvider");
    }
    return contexto;
}