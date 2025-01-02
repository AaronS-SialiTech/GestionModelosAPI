# 1. Usa una imagen base oficial de Node.js
FROM node:20-alpine

# 2. Configura el directorio de trabajo en el contenedor
WORKDIR /home/sialo21/Documentos/GitHub/PruebasSupabase/GestionModelosAPI/GestionModelosAPI/modelos_api_aaron
RUN ls -l ./app
RUN ls -l nextapi
# 3. Copia los archivos necesarios para instalar dependencias
COPY package.json nextapi/package.json

# 4. Instala las dependencias
RUN npm install pnpm
RUN npm install -g npm

#RUN npm install

RUN ls -l ./app
RUN ls -l nextapi

# 5. Copia todo el código fuente de tu aplicación
COPY app nextapi/app

# 6. Compila la aplicación (Next.js)
RUN npm run build

# 7. Expone el puerto que utiliza la aplicación
EXPOSE 3000

# 8. Comando por defecto para ejecutar la app
CMD ["npm", "start"]
