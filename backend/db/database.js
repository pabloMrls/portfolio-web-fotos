//conexión a la base de datos

import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dbPromise = open({
    filename: "./database.bd",
    driver: sqlite3.Database
});

//Abre (o crea) database.db
//Devuelve una promesa reutilizable