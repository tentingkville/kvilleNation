import React, { useState } from 'react';
import { Link } from "react-router-dom";
import '../styles/questions.css';

function Questions() {

    const questions = [
        {
          q: "Q1",
          a: "Q1 Answer",
        },
        {
          q: "Q2",
          a: "Q2 Answer",
        },
        {
          q: "Q3",
          a: "Q3 Answer",
        },
        {
          q: "Q4",
          a: "Q4 Answer",
        },
        {
          q: "Q5",
          a: "Q5 Answer",
        },
      ];

      const [openIndex, setOpenIndex] = useState(null);

      const toggleAnswer = (index) => {
        setOpenIndex(openIndex === index ? null : index);
      };
    
      return (
        <div className="questions">
          <p className="title">Commonly Asked Questions</p>
          <p className="content">
            For any additional questions not answered here, please check out our{" "}
            <Link to="/contacts" className="contacts-link">
              Contacts
            </Link>{" "}
            page to see who to reach out to.
          </p>
    
          {questions.map((item, index) => (
            <div
              key={index}
              className={`box ${openIndex === index ? "open" : ""}`}
            >
              <div
                className="header"
                onClick={() => toggleAnswer(index)}
              >
                <span>{index + 1}. {item.q}</span>
                <span className="arrow">{openIndex === index ? "▲" : "▼"}</span>
              </div>
              {openIndex === index && (
                <div className="answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

export default Questions;
