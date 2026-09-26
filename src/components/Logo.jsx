const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";

export const LOGO_URL =
  "https://media.db.com/images/public/6ab43e4649bfa7413ab0b0a8/e6576828f_images.jpg";

export default function Logo({ className = "w-10 h-10" }) {
  return (
    <img
      src={LOGO_URL}
      alt="Colégio Portal do Saber"
      className={`rounded-full object-cover shrink-0 ${className}`}
    />
  );
}