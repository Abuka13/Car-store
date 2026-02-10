// client/src/api/cars.api.js

const API_URL = "http://localhost:8080";

export async function getCars() {
  const res = await fetch(`${API_URL}/cars`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Не удалось загрузить автомобили");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.cars || [];
}

export async function getCarById(id) {
  const res = await fetch(`${API_URL}/cars`);
  if (!res.ok) return null;

  const data = await res.json();

  const cars = Array.isArray(data) ? data : data.cars;
  if (!Array.isArray(cars)) return null;

  return cars.find((c) => String(c.id) === String(id)) || null;
}



export async function createCar(car) {
  const res = await fetch(`${API_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(car),
  });

  if (!res.ok) {
    throw new Error("Не удалось создать автомобиль");
  }

  return res.json();
}

export async function updateCar(car) {
  const res = await fetch(`${API_URL}/cars`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(car),
  });

  if (!res.ok) {
    throw new Error("Не удалось обновить автомобиль");
  }

  return res.json();
}

export async function deleteCar(id) {
  const res = await fetch(`${API_URL}/cars?id=${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Не удалось удалить автомобиль");
  }

  return true;
}
