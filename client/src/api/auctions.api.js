// client/src/api/auctions.api.js

const API_URL = "http://localhost:8080";

export async function getAuctions() {
  const res = await fetch(`${API_URL}/auctions`);
  if (!res.ok) throw new Error("Не удалось загрузить аукционы");
  return res.json();
}


export async function createAuction(data) {
  const res = await fetch(`${API_URL}/auctions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка создания аукциона");
  return res.json();
}

export async function updateAuction(data) {
  const res = await fetch(`${API_URL}/auctions`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка обновления аукциона");
  return res.json();
}

export async function deleteAuction(id) {
  const res = await fetch(`${API_URL}/auctions?id=${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ошибка удаления аукциона");
  return true;
}

export async function placeBid(data) {
  const res = await fetch(`${API_URL}/auctions/bid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка ставки");
  return res.json();
}
