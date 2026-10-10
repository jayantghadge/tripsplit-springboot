import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import RequireAuth, { RequireAdmin } from './components/RequireAuth'

const Home = lazy(() => import('./components/Home'))
const Auth = lazy(() => import('./components/Auth'))
const TripList = lazy(() => import('./components/TripList'))
const TripDetail = lazy(() => import('./components/TripDetail'))
const EditTrip = lazy(() => import('./components/EditTrip'))
const PublicView = lazy(() => import('./components/PublicView'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const NotFound = lazy(() => import('./components/NotFound'))

function PageLoading() {
  return (
    <div className="page-loading">
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/view/:token" element={<PublicView />} />

            <Route element={<Layout />}>
              <Route path="/trips" element={<RequireAuth><TripList /></RequireAuth>} />
              <Route path="/trips/new" element={<RequireAuth><EditTrip /></RequireAuth>} />
              <Route path="/trips/:id" element={<RequireAuth><TripDetail /></RequireAuth>} />
              <Route path="/trips/:id/edit" element={<RequireAuth><EditTrip /></RequireAuth>} />
              <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
