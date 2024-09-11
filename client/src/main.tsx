import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createRoot } from "react-dom/client";

import {Amplify} from 'aws-amplify';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react';
import awsExports from './aws-exports';

import "./index.css";
import App from "./App.tsx";
import Items from "./Pages/items.tsx";
import Profile from "./Pages/profile.tsx";
import Authentication from "./Pages/authentication.tsx";
import Login from "./Pages/login.tsx";
import Collections from "./Pages/collections.tsx";
import NewCollectionForm from "./Pages/new_collection_form.tsx";
import NewCollectionStart from "./Pages/new_collection_start.tsx";
import NewCollectionSearchMatches from "./Pages/new_collection_search_matches.tsx";
import UploadCollection from "./Pages/upload_collection_csv.tsx";

import './custom-amplify-styles.css';

Amplify.configure(awsExports);

function ProtectedRoute({ children }: { children: JSX.Element }) {
  return (
    <Authenticator>
      {({ user }) => {
        if (!user) return <Navigate to="/auth" />;
        return children;
      }}
    </Authenticator>
  );
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      {/* unauthenticated routes */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Authentication />} />

      {/* authenticated routes */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
        <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
        <Route path="/new_collection_form" element={<ProtectedRoute><NewCollectionForm /></ProtectedRoute>} />
        <Route path="/new_collection_start" element={<ProtectedRoute><NewCollectionStart /></ProtectedRoute>} />
        <Route path="/new_collection_search_matches" element={<ProtectedRoute><NewCollectionSearchMatches /></ProtectedRoute>} />
        <Route path="/upload_collection_csv" element={<ProtectedRoute><UploadCollection /></ProtectedRoute>} />
    </Routes>
</BrowserRouter>
);
