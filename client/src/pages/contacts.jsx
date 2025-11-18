import React from "react";
import "../styles/contacts.css";

function Contacts() {
  const contacts = [
    { role: "Head Line Monitors", info: "General inquiries", email: "headlinemonitor@gmail.com" },
    { role: "VPs of Tenting", info: "Tenting-related inquiries, i.e. roster changes", email: "tenting.kville@gmail.com" },
    { role: "VPs of Gameday", info: "Gameday-related inquiries, i.e. WUL information", email: "operationsgameday@gmail.com" },
    { role: "Student Disability & Accommodations Office (SDAO)", info: "Accommodations needed for games, tenting, financial aid, etc.", email: "leigh.millar@duke.edu" },
  ];

  return (
    <div className="contacts">
      <p className="title">Contact Information</p>
      {contacts.map((c, index) => (
        <div key={index} className="card">
            <p className="role">{c.role}</p>
            <p className="info">{c.info}</p>
            <p className="email">{c.email}</p>
        </div>
      ))}
    </div>
  );
}

export default Contacts;
