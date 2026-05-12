import { formatCurrency } from "@/lib/utils";

export const roles = [
  { id: 1, name: "admin" },
  { id: 2, name: "cashier" },
];

export const branches = [
  { id: 1, name: "Cabang Jakarta", address: "Jl. Melati No. 1, Jakarta" },
  { id: 2, name: "Cabang Bandung", address: "Jl. Braga No. 7, Bandung" },
  { id: 3, name: "Cabang Surabaya", address: "Jl. Rajawali No. 10, Surabaya" },
];

export const categories = [
  { id: 1, name: "Minuman" },
  { id: 2, name: "Makanan" },
  { id: 3, name: "Snack" },
];

export const products = [
  { id: 1, name: "Americano", price: 18000, stock: 45, categoryId: 1, branchId: 1 },
  { id: 2, name: "Latte", price: 24000, stock: 32, categoryId: 1, branchId: 1 },
  { id: 3, name: "Croissant", price: 22000, stock: 18, categoryId: 2, branchId: 1 },
  { id: 4, name: "Mie Goreng", price: 28000, stock: 24, categoryId: 2, branchId: 2 },
  { id: 5, name: "Es Teh Lemon", price: 14000, stock: 50, categoryId: 1, branchId: 2 },
  { id: 6, name: "Keripik Kentang", price: 12000, stock: 16, categoryId: 3, branchId: 3 },
];

export const users = [
  {
    id: 1,
    username: "admin",
    password:
      "$2b$10$3WeiTyktmesma7FRw.yFf.FgmpUAY1DuitKoJ.Asj4RS1dJnHH4vq",
    roleId: 1,
    branchId: 1,
  },
  {
    id: 2,
    username: "kasir01",
    password:
      "$2b$10$nDww0oCr3PZEC2jKdpQIsunAPxIsI9twSzVrBu/CNTHs7XKhFui4q",
    roleId: 2,
    branchId: 2,
  },
  {
    id: 3,
    username: "adminops",
    password:
      "$2b$10$Co1lMaKsatmI2LtGGH7X0e2DFtu.oAHNbwVHiikPM.WZ3V5tSVZea",
    roleId: 1,
    branchId: 1,
  },
  {
    id: 4,
    username: "adminbdg",
    password:
      "$2b$10$5DjGoAWUTAehVpFrKfPgKe9qp1uztcqzJSlWN/Ui66Vjz6rEvqUCu",
    roleId: 1,
    branchId: 2,
  },
  {
    id: 5,
    username: "kasirjkt",
    password:
      "$2b$10$nh8OLuMKoHgRbM9om1g/Rej6e.y0p6AN5NrPQR9LxqS1iBxXF375W",
    roleId: 2,
    branchId: 1,
  },
  {
    id: 6,
    username: "kasirsby",
    password:
      "$2b$10$d9b5Co3/norE9xbIpqEP1OHOGeq6zyISHFhGpCReLTDqKiIoci30i",
    roleId: 2,
    branchId: 3,
  },
];

export const transactions = [
  {
    id: 1,
    invoiceNumber: "INV-20260407-001",
    userId: 2,
    branchId: 2,
    total: 56000,
    createdAt: "2026-04-07 10:40:00",
  },
  {
    id: 2,
    invoiceNumber: "INV-20260407-002",
    userId: 1,
    branchId: 1,
    total: 58000,
    createdAt: "2026-04-07 11:10:00",
  },
];

export const transactionDetails = [
  { id: 1, transactionId: 1, productId: 4, qty: 2, price: 28000, subtotal: 56000 },
  { id: 2, transactionId: 2, productId: 1, qty: 2, price: 18000, subtotal: 36000 },
  { id: 3, transactionId: 2, productId: 3, qty: 1, price: 22000, subtotal: 22000 },
];

export function getResolvedProducts() {
  return products.map((product) => {
    const category = categories.find((item) => item.id === product.categoryId);
    const branch = branches.find((item) => item.id === product.branchId);

    return {
      ...product,
      categoryName: category?.name || "-",
      branchName: branch?.name || "-",
      priceNumber: product.price,
      price: formatCurrency(product.price),
    };
  });
}
