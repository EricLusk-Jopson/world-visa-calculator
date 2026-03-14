import { createBrowserRouter } from "react-router";
import LandingPage from "@/pages/LandingPage";
import AppPage from "@/pages/AppPage";
import SharedPage from "@/pages/SharedPage";
import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: <AppPage />,
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
