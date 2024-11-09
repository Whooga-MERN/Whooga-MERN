import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createRoot } from "react-dom/client";

import { Amplify } from "aws-amplify";
import { Authenticator, withAuthenticator } from "@aws-amplify/ui-react";
import awsExports from "./aws-exports.ts";

import "./index.css";
import App from "./App.tsx";
import Items from "./Pages/items.tsx";
import Authentication from "./Pages/authentication.tsx";
import Login from "./Pages/login.tsx";
import Collections from "./Pages/collections.tsx";
import Details from "./Pages/details.tsx";
import NewCollectionForm from "./Pages/new_collection_form.tsx";
import NewCollectionStart from "./Pages/new_collection_start.tsx";
import NewCollectionSearchMatches from "./Pages/new_collection_search_matches.tsx";
import UploadCollection1 from "./Pages/upload_collection_csv_page1.tsx";
import UploadCollection2 from "./Pages/upload_collection_csv_page2.tsx";
import Profile from "./Pages/profile.tsx";
import MessageSignup from "./Pages/message_signup.tsx";
import Wishlist from "./Pages/wishlist.tsx";
import WishlistItems from "./Pages/wishlist_items.tsx";
import BulkUpload from "./Pages/bulk_upload.tsx";
import BulkUploadStep2 from "./Pages/bulk_upload_step_2.tsx";
import PrivacyPolicy from "./Pages/privacypolicy.tsx";
import ContactUs from "./Pages/contactus.tsx";

import "./custom-amplify-styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

Amplify.configure(awsExports);
const queryClient = new QueryClient();

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
  <>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* unauthenticated routes */}
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/message_signup" element={<MessageSignup />} />

          {/* new routes for the Privacy Policy and Contact Us pages */}
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/contactus" element={<ContactUs />} />

          {/* authenticated routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:universeCollectionId"
            element={
              <ProtectedRoute>
                <Items />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new_collection_form"
            element={
              <ProtectedRoute>
                <NewCollectionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new_collection_start"
            element={
              <ProtectedRoute>
                <NewCollectionStart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new_collection_search_matches"
            element={
              <ProtectedRoute>
                <NewCollectionSearchMatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload_collection_csv_page1"
            element={
              <ProtectedRoute>
                <UploadCollection1 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload_collection_csv_page2"
            element={
              <ProtectedRoute>
                <UploadCollection2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/details"
            element={
              <ProtectedRoute>
                <Details />
              </ProtectedRoute>
            }
          />
          {/* <Route
      path="/message_signup"
      element={
        <ProtectedRoute>
          <MessageSignup />
        </ProtectedRoute>
      }
    /> */}
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist/:collectionId"
            element={
              <ProtectedRoute>
                <WishlistItems />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </>
);
