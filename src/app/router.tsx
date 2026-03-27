import { createBrowserRouter } from "react-router";
import SharedPage from "@/pages/SharedPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { CalculatorPage } from "@/pages/CalculatorPage";

export const router = createBrowserRouter([
  {
    path: "/app",
    element: <CalculatorPage />,
  },
  {
    path: "/shared/:token",
    element: <SharedPage />,
  },
  // Future routes:
  // { path: '/blog', element: <BlogPage /> },
  // { path: '/blog/:slug', element: <BlogPostPage /> },
  // { path: '/privacy', element: <PrivacyPage /> },
  // { path: '/terms', element: <TermsPage /> },
  // { path: '/auth/login', element: <LoginPage /> },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
