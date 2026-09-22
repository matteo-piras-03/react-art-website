import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";

import '../scss/root.scss'
import '../scss/colors.scss'
import '../scss/typography.scss'

import Header from "./page_elements/Header";
import Footer from "./page_elements/Footer";
const Index = lazy(() => import("./Index.jsx"));
const Art = lazy(() => import("./Art.jsx"));
const Blog = lazy(() => import("./Blog.jsx"));
const Warmups = lazy(() => import("./Warmups.jsx"));

function App() {
  return (
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/art/*" element={<Art />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:postId" element={<Blog />} />
          <Route path="/warmups/*" element={<Warmups />} />
        </Routes>
        <Footer />
      </BrowserRouter>
  );
}

export default App;