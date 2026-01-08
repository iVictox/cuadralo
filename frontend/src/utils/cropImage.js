// Esta utilidad crea una imagen recortada usando un canvas HTML5 invisible
// Basado en ejemplos estándar de react-easy-crop

export const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // Necesario para evitar problemas de CORS si la imagen viene de otro dominio
      image.src = url;
    });
  
  export async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    if (!ctx) {
      return null;
    }
  
    // Configurar el tamaño del canvas al tamaño del recorte deseado
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
  
    // Dibujar la imagen recortada en el canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  
    // Convertir el canvas a un Blob (un archivo en memoria)
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        // Asignar un nombre genérico al blob
        blob.name = "cropped_image.jpeg";
        resolve(blob);
      }, "image/jpeg", 0.9); // Calidad JPG 90%
    });
  }