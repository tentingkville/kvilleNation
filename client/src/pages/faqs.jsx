import React, { useState } from 'react';
import { Link } from "react-router-dom";
import kvilleBoundaries from "../images/kvilleboundaries.png"
import '../styles/faqs.css';

function FAQs() {

    const faqs = [
        {
          q: "What are the K-Ville boundaries?",
          a: (
            <div className="img-answer-content">
              <img 
                src={kvilleBoundaries}
                className="img-answer"
                alt='kville-boundaries' 
              />
              <p>
                Krzyzewskiville is formally defined as the grassy lawn area in front of Card and
                Wilson gyms, their surrounding sidewalks, and the plaza in front of Cameron and
                the Schwartz-Butters Building. Students who are on duty for their tent or walk-up line
                group should remain within these boundaries at all times unless given specific permission
                from a Line Monitor. Otherwise, if a check is called and you are not within the specified 
                boundaries while on shift, it will count as a missed check.
              </p>
            </div>
          ),
        },
        {
          q: "How do I go to a (non-UNC) home Duke basketball game?",
          a: (
            <div>
              <p>
                Register for the walk-up line (WUL)! The walk-up line is a process that students partake
                in to gain entry to home games (with the exception of the UNC game). To register, one-third
                of your group must visit the Line Monitor table at the front of K-Ville in order to be added to 
                the list. When registering, you will give your group size as a multiple of three, rounding up when
                necessary. Once your group is registered, one-third of your group must be in K-Ville at all times.
                For example: a group of 10 people would register as a group of 12, and 4 of them must
                be in K-Ville at all times. When you first check in for your group, you will be required to
                show your Duke Card; there is no need to check out when your shift is over. Additionally, 
                checks will be called by Line Monitors at random points throughout the day; there is 
                <strong> no </strong> grace period between checks.
              </p>
              <p>
                For most games, WUL registration is open from 7am on game day until two hours before game time.
                Different rules and start times will apply for "Designated Big Games," which are expected to be 
                Florida and Louisville for the 2025-2026 season, but will be further communicated by the Head Line
                Monitors and VPs of Gameday throughout the season. Two hours before the scheduled game start time, 
                your entire group must be in K-Ville for line up.
              </p>
              <p>
                <strong>
                For a more detailed description of the walk-up line, please see Section 2 of our{" "}
                <Link to="/policy">Official Policy</Link>.
                </strong>
              </p>
            </div>
          ),
        },
        {
          q: "What is tenting? What are the different levels?",
          a: (
            <div>
              <p>
                Tenting is the process that students must partake in to earn a spot in Cameron for the UNC game!
                A tent is composed of 10 to 12 people and there are three different levels of tenting, based on intensity—higher 
                intensity gets you a better spot. The three periods of tenting are Black, Blue, and White. The requirements are as follows:
              </p>
              <p>
                <strong>Black: 10 tent members in K-Ville at night, 2 during the day</strong>
              </p>
              <p>
                <strong>Blue: 6 tent members in K-Ville at night, 1 during the day</strong>
              </p>
              <p>
                <strong>White: 2 tent members in K-Ville at night, 1 during the day</strong>
              </p>               
              <p> 
                Note that for Black tenting, if more than 80 tents indicate interest, there will be a Duke MBB-related trivia test
                based on the 2025-2026 season in order to earn a spot in K-Ville. For White tenting, you must earn your spot by participating
                in a scavenger hunt called Race to the Secret Spots. Further information will be communicated by the Head Line Monitors and 
                VPs of Tenting later in the season. 
              </p>
              <p>
                <strong>
                For a more detailed description of tenting, please see Section 4 of our{" "}
                <Link to="/policy">Official Policy</Link>.
                </strong>
              </p>
            </div>
          ),
        },
        {
          q: "What are the different tenting tests and what do they mean?",
          a: (
            <div>
              <p>
              The Black Tenting Test (“Entry Test”) will occur if more than 80 tents register for Black tenting
              within the first 48 hours of tent registration; test content will be based on the 2025-2026 Duke MBB
              season only. Tents that score within the top 70 will receive a Black tenting spot, and tents scoring
              71-80 will receive a Blue tenting spot in the order of their score.
              </p>
              <p>
              The Ordering Test happens every year and is only for Black tenters. In contrast to the entry test, 
              it tests <strong> all </strong> of Duke MBB history. Your tent’s score will factor into the eventual ordering of Black tents.
              </p>
            </div>
          ),
        },
        {
          q: "What does it mean to Dirty Black or Dirty Blue tent?",
          a: (
            <p> Afraaz working on it </p>
          ),
        },
        {
          q: "Can we change who is in our tent after we have registered our tent?",
          a: (
            <p> Afraaz working on it </p>
          ),
        },
        {
          q: "When do we get grace during tenting?",
          a: (
            <div>
              <p>
              As a reminder, there is <strong> no </strong> grace for WUL–the following conditions only apply
              to those tenting for the UNC game. Grace will occur: 
              </p>
              <p>
                <strong> After every tent check for one hour. </strong>
              </p>
              <p>
                <strong> Two hours before and after a Men’s or Women’s home basketball game. </strong>
              </p>
              <p>
                <strong> One hour before and after a Men’s or Women’s away basketball game. </strong>
              </p>
              <p>
                <strong> Weather-related grace is given in the following circumstances: Temperatures below or equal to 32°F, 
                greater than 2” of accumulated snow, sustained winds higher than 35 mph, lightning within a six-mile radius, 
                severe weather warnings, icy conditions, school closure. </strong>
              </p>
              <p>
                <strong> At any time, for any length at the discretion of the Head Line Monitors. </strong>
              </p>
              <p>
                Note that grace will <strong> always </strong> be communicated by Line Monitors in the shared Slack channel, 
                which will be sent to all tenters early in the spring semester.
              </p>
            </div>
          ),
        },
        {
          q: "Can I tent for UNC and wait in line for other games at the same time?",
          a: (
            <p> Afraaz working on it </p>
          ),
        },
        {
          q: "I am worried about the financial and/or physical burden of tenting. Does Duke provide resources to help with this?",
          a: (
            <div>
              <p>
                Yes! For financial concerns, the Tenting Loaner Program is available to provide tenters with free equipment such as sleeping bags,
                lanterns, etc. Need-related assessments will be conducted by Student Involvement and Leadership and details on how to apply 
                will be sent out in early December. For accessibility accommodations needed for WUL, tenting, accessible seating in
                Cameron, etc., please reach out to the Head Line Monitors (headlinemonitors@gmail.com) or our representative in the SDAO office (leigh.bhe@duke.edu). 
              </p>
              <p>
                <strong>
                Contact information can additionally be found on our{" "}
                <Link to="/contacts">Contact Information</Link> page.
                </strong>
              </p>
            </div>
          ),
        },
      ];

      const [openIndexes, setOpenIndexes] = useState([]);

      const toggleAnswer = (index) => {
        if (openIndexes.includes(index)) {
          setOpenIndexes(openIndexes.filter((i) => i !== index));
        } else {
          setOpenIndexes([...openIndexes, index]);
        }
      };
    
      return (
        <div className="faqs">
          <p className="title">Frequently Asked Questions</p>
          <p className="content">
            For any additional questions not answered here, please refer to our{" "}
            <Link to="/contacts" className="contacts-link">
              Contact Information
            </Link>{" "}
            page to see who to reach out to.
          </p>
          {faqs.map((item, index) => (
            <div
              key={index}
              className={`box ${openIndexes.includes(index) ? "open" : ""}`}
            >
              <div
                className="header"
                onClick={() => toggleAnswer(index)}
              >
                <span>{index + 1}. {item.q}</span>
                <span className="arrow">
                  {openIndexes.includes(index) ? "▲" : "▼"}
                </span>
              </div>
              {openIndexes.includes(index) && (
                <div className="answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

export default FAQs;
