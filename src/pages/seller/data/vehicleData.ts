
// Mock data for dropdowns - in a real app, these would come from an API
export const carBrands = [
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "nissan", label: "Nissan" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "ford", label: "Ford" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes", label: "Mercedes-Benz" },
  { value: "audi", label: "Audi" },
];

export const carModels: Record<string, Array<{value: string, label: string}>> = {
  toyota: [
    { value: "corolla", label: "Corolla" },
    { value: "camry", label: "Camry" },
    { value: "rav4", label: "RAV4" },
    { value: "highlander", label: "Highlander" },
    { value: "4runner", label: "4Runner" },
    { value: "sequoia", label: "Sequoia" },
  ],
  honda: [
    { value: "civic", label: "Civic" },
    { value: "accord", label: "Accord" },
    { value: "crv", label: "CR-V" },
    { value: "pilot", label: "Pilot" },
  ],
  // Add models for other brands as needed
};

export const years = Array.from({ length: 22 }, (_, i) => {
  const year = 2024 - i;
  return { value: year.toString(), label: year.toString() };
});

export const carVersions: Record<string, Array<{value: string, label: string}>> = {
  corolla: [
    { value: "le", label: "LE" },
    { value: "se", label: "SE" },
    { value: "xle", label: "XLE" },
    { value: "xse", label: "XSE" },
  ],
  civic: [
    { value: "lx", label: "LX" },
    { value: "sport", label: "Sport" },
    { value: "ex", label: "EX" },
    { value: "touring", label: "Touring" },
  ],
  // Add versions for other models as needed
};

export const mexicanStates = [
  { value: "cdmx", label: "Ciudad de México" },
  { value: "jalisco", label: "Jalisco" },
  { value: "nuevo_leon", label: "Nuevo León" },
  { value: "estado_mexico", label: "Estado de México" },
  { value: "chihuahua", label: "Chihuahua" },
  { value: "guanajuato", label: "Guanajuato" },
  // Add more Mexican states as needed
];

export const carFeatures = [
  { id: "sunroof", label: "Techo solar" },
  { id: "leather", label: "Asientos de piel" },
  { id: "navigation", label: "Sistema de navegación" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "camera", label: "Cámara de reversa" },
  { id: "sensors", label: "Sensores de estacionamiento" },
  { id: "keyless", label: "Entrada sin llave" },
  { id: "automatic", label: "Transmisión automática" },
  { id: "climate", label: "Control de clima automático" },
  { id: "alloy", label: "Rines de aleación" },
];
