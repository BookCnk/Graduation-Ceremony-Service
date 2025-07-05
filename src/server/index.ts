import { Server } from "socket.io";

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("hello", (msg) => {
      console.log("💬 hello:", msg);
    });
  });
};  