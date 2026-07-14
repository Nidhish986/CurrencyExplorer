import { Suspense, lazy } from "react";
import { Navigate, Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AppProvider } from "./context/AppContext";
import { SkeletonCard } from "./components/SkeletonCard";

const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const Converter = lazy(() => import("./pages/Converter").then((module) => ({ default: module.Converter })));
const SalaryComparisonPage = lazy(() => import("./pages/SalaryComparisonPage").then((module) => ({ default: module.SalaryComparisonPage })));
const History = lazy(() => import("./pages/History").then((module) => ({ default: module.History })));
const Explorer = lazy(() => import("./pages/Explorer").then((module) => ({ default: module.Explorer })));
const Favorites = lazy(() => import("./pages/Favorites").then((module) => ({ default: module.Favorites })));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route index element={<Dashboard />} />
      <Route path="converter" element={<Converter />} />
      <Route path="salary-comparison" element={<SalaryComparisonPage />} />
      <Route path="history" element={<History />} />
      <Route path="explorer" element={<Explorer />} />
      <Route path="favorites" element={<Favorites />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

export function App() {
  return (
    <AppProvider>
      <Suspense fallback={<div className="mx-auto max-w-7xl p-4"><SkeletonCard /></div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>
  );
}
