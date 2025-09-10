// SMART-TDAH - Ángel Álvarez Rey
// Licensed under GNU GPL v3.0
import * as actionTypes from "./actionTypes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const pool = require('./dbConfig'); 

//Esta función maneja el proceso de inicio de sesión de un usuario.
export const login = (email, password, onSuccess, onError) => async (dispatch) => {
    try { 
        const client = await pool.connect(); //Establece una conexión con la base de datos.
        const res = await client.query('SELECT * FROM profesores WHERE email = $1', [email]); //Ejecuta una consulta SQL para buscar un usuario con el correo electrónico proporcionado.
        client.release(); //Libera la conexión con la base de datos.

        if (res.rows.length > 0) { //Comprueba si se encontró un usuario con el correo electrónico proporcionado.
            const user = res.rows[0]; //Obtiene los datos del usuario encontrado.
            const match = await bcrypt.compare(password, user.password); //Compara la contraseña proporcionada con la contraseña almacenada en la base de datos.

            if (match) { //Si las contraseñas coinciden
                const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '1h' }); //Genera un token JWT con el ID del usuario.
                dispatch(loginCompleted({ ...user, token })); // Despacha una acción de inicio de sesión completado con los datos del usuario y el token JWT.
                onSuccess({ ...user, token }); //Llama a la función onSuccess con los datos del usuario y el token JWT.
            } else { //Si las contraseñas no coinciden.
                onError('Invalid password'); 
            }
        } else { //Si no se encuentra un usuario con el correo electrónico proporcionado.
            onError('User not found');
        }
    } catch (error) { //Si ocurre un error durante el try.
        onError(error.message);
    }
};

//Esta función despacha una acción de inicio de sesión completado con los datos del usuario.
const loginCompleted = (user) => ({
    type: actionTypes.LOGIN_COMPLETED, //Tipo de acción.
    user, //Datos del usuario.
});

//Esta función despacha una acción de cierre de sesión completado con los datos del usuario.
const logoutCompleted = (user) => ({
    type: actionTypes.LOGOUT_COMPLETED, //Tipo de acción.
    user, //Datos del usuario. 
});

//Esta función despacha una acción de restablecimiento de contraseña completado con los datos del usuario.
const resetPasswordCompleted = (user) => ({ 
    type: actionTypes.RESET_PASSWORD_COMPLETED, //Tipo de acción.
    user, //Datos del usuario.
});

//Esta función despacha una acción de creación de usuario completada con los datos del usuario.
const createUserCompleted = (user) => ({
    type: actionTypes.CREATE_USER_COMPLETED, //Tipo de acción.
    user, //Datos del usuario. 
});

//Esta función maneja el proceso de cierre de sesión de un usuario. 
//Despacha una acción de cierre de sesión completado con los datos del usuario y llama a la función action.
export const logout = (action) => (dispatch) => {
    dispatch(logoutCompleted(null));
    action(); 
};

//Esta función maneja el proceso de restablecimiento de contraseña de un usuario.
export const resetPassword = (email, onSuccess, onError) => async (dispatch) => {
    try {
        const client = await pool.connect(); //Establece una conexión con la base de datos.
        const res = await client.query('SELECT * FROM profesores WHERE email = $1', [email]); //Busca en ella un usuario con el correo electrónico proporcionado.
        client.release(); //Libera la conexión con la base de datos.

        if (res.rows.length > 0) { //Comprueba si se encontró un usuario con el correo electrónico proporcionado.
            //##############################################################################
            // [IMPLEMENTAR] Logica para restablecer la contraseña
            //##############################################################################
            dispatch(resetPasswordCompleted(null)); //Despacha una acción de restablecimiento de contraseña completado con los datos del usuario.
            onSuccess(); 
        } else { //Si no se encuentra un usuario con el correo electrónico proporcionado.
            onError('User not found');
        }
    } catch (error) { //Si ocurre un error durante el try.
        onError(error.message);
    }
};

//Esta función maneja el proceso de creación de un nuevo usuario.
export const createUser = (email, nombre, apellidos, password, onSuccess, onError) => async (dispatch) => {
    try {
        const client = await pool.connect(); //Establece una conexión con la base de datos.
        const res = await client.query('SELECT * FROM profesores WHERE email = $1', [email]); //Busca en ella un usuario con el correo electrónico proporcionado.

        if (res.rows.length > 0) { //Comprueba si se encontró un usuario con el correo electrónico proporcionado.
            const hashedPassword = await bcrypt.hash(password, 10); //Genera un hash de la contraseña proporcionada.
            await client.query('INSERT INTO profesores (email, nombre, apellidos, password) VALUES ($1, $2, $3, $4) RETURNING id_profesor', [email, nombre, apellidos, hashedPassword]); //Inserta un nuevo usuario en la base de datos. 
            client.release(); //Libera la conexión con la base de datos.

            dispatch(createUserCompleted(null)); // Despacha una acción de creación de usuario completada con los datos del usuario.
            onSuccess();
        } else { //Si ya existe un usuario con el correo electrónico proporcionado.
            client.release();
            onError('Permission denied');
        }
    } catch (error) {
        onError(error.message);
    }
};