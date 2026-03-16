import { createBrowserRouter, Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Pages
import { Home } from '@/pages/Home'
import { Blog } from '@/pages/Blog'
import { BlogPost } from '@/pages/BlogPost'
import { Login } from '@/pages/admin/Login'
import { PostList } from '@/pages/admin/PostList'
import { PostEditor } from '@/pages/admin/PostEditor'
import { ProfileEditor } from '@/pages/admin/ProfileEditor'
import { BlogSettings } from '@/pages/admin/BlogSettings'
import { ApiKeys } from '@/pages/admin/ApiKeys'
import { Comments } from '@/pages/admin/Comments'
import { ApiDocs } from '@/pages/ApiDocs'
import { StorePage } from '@/pages/StorePage'
import { StoreEditor } from '@/pages/admin/StoreEditor'
import { NotFound } from '@/pages/NotFound'

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'blog', element: <Blog /> },
      { path: 'blog/:slug', element: <BlogPost /> },
      { path: 'docs', element: <ApiDocs /> },
      { path: 'store', element: <StorePage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'posts', element: <PostList /> },
      { path: 'posts/new', element: <PostEditor /> },
      { path: 'posts/:id/edit', element: <PostEditor /> },
      { path: 'profile', element: <ProfileEditor /> },
      { path: 'settings', element: <BlogSettings /> },
      { path: 'api-keys', element: <ApiKeys /> },
      { path: 'comments', element: <Comments /> },
      { path: 'store', element: <StoreEditor /> },
    ],
  },
])
