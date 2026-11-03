import axios from "axios";

const cliente = axios.create({
    baseURL: "http://localhost:8081/api",
    timeout: 10000
});

export const solicitudesApi = {
    listar: (signal) => cliente.get("/solicitudes", { signal }),
    crear: (descripcion) => cliente.post("/solicitudes", { descripcion }),
    cambiarEstado: (id, estado) => cliente.put(`/solicitudes/${id}`, { estado }),
    eliminar: (id) => cliente.delete(`/solicitudes/${id}`)
};