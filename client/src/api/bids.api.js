import { api } from "./http";

export const placeBid = ({ auction_id, user_id, amount }) =>
  api("/auctions/bid", { method: "POST", body: JSON.stringify({ auction_id, user_id, amount }) });
