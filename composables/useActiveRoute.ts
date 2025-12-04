export function useActiveRoute() {
  const route = useRoute();

  const isActive = (path: string) => {
    if (!path) return false;

    // Exact match
    if (route.path === path) return true;

    // Treat nested routes (e.g. /warehouse/:id/sku) as active
    // for their base menu path (e.g. /warehouse).
    return route.path.startsWith(path + "/");
  };

  return { isActive };
}
