export type Direction = "up" | "down" | "left" | "right";

export function positionAfterDirection(x: number, y: number, direction: Direction): { x: number; y: number } {
  if (direction == "up") return { x, y: y - 1 };
  if (direction == "down") return { x, y: y + 1 };
  if (direction == "left") return { x: x - 1, y };
  if (direction == "right") return { x: x + 1, y };
  return { x, y };
}

export function flipDirection(direction: Direction): Direction {
  if (direction == "up") return "down";
  if (direction == "down") return "up";
  if (direction == "left") return "right";
  if (direction == "right") return "left";
}
