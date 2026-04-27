import { apiRequest } from "./apiClient";

export async function reportLostItem(payload) {
  return apiRequest("/lost-found/lost", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function reportFoundItem(payload) {
  return apiRequest("/lost-found/found", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteLostItem(id) {
  await apiRequest(`/lost-found/${id}`, {
    method: "DELETE",
  });
}

export async function getLostItems() {
  const data = await apiRequest("/lost-found/lost");
  return data || [];
}

export async function getFoundItems() {
  const data = await apiRequest("/lost-found/found");
  return data || [];
}