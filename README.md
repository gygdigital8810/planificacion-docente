# Planificación docente · noviembre 2026

Aplicación para Vercel y Google Sheets como almacenamiento. La interfaz no indica dónde se guardan los aportes.

1. Crear una hoja dedicada y copiar su ID de la dirección, entre /d/ y /edit.
2. En la hoja, abrir Extensiones > Apps Script y pegar google-apps-script.js en Código.gs.
3. En Configuración del proyecto > Propiedades del script, crear SPREADSHEET_ID con el ID de la hoja y SHEET_API_SECRET con una cadena secreta larga y aleatoria.
4. Implementar como aplicación web que se ejecuta como propietario, con el acceso necesario para que Vercel la invoque. Google solicitará autorizar el acceso a la hoja. Copiar la URL de implementación terminada en /exec.
5. Importar el proyecto en Vercel y configurar las variables SHEET_WEBAPP_URL con la URL anterior, SHEET_API_SECRET con el mismo secreto, COORDINATOR_PASSWORD con la contraseña elegida y SESSION_SECRET con otra cadena aleatoria de al menos 32 caracteres. No subir secretos a GitHub. Volver a desplegar después de cambiar variables.
6. Probar el envío desde un navegador y comprobar su aparición desde otro. La pestaña Respuestas se crea con la primera consulta. Google Sheets permite descargar la hoja como Excel.

La vista local estática permite revisar la interfaz, pero no ejecuta las funciones de Vercel. Los envíos requieren la conexión desplegada. Los archivos antiguos config.js y supabase.sql ya no se utilizan.

La selección de nombre no autentica a los docentes. El filtrado por semestre organiza la interfaz, pero el acceso directo a la API permite consultar todos los registros. Para privacidad real se requieren cuentas individuales y controles de acceso en el servidor. El acceso de coordinación no incluye límites de intentos; antes de producción añadir protección contra fuerza bruta y usar una contraseña fuerte.
