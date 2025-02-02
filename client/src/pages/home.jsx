import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/home.css";
import bannerImage from '../images/kvillenationbanner.png';
import InstagramEmbedKvilleNation from '../components/kville_official_ig.jsx';
import InstagramEmbedDukeMBB from '../components/dukembb_ig.jsx';
import SpotifyEmbed from '../components/spotifyEmbed.jsx';


const Home = () => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
  const [data, setData] = useState({
    record: '',
    standing: '',
    nextOpponent: '',
    rank: '',
    numTents: 0,
  });
  const handleRegisterClick = () => {
    window.location.href = 'https://urldefense.com/v3/__https://airtable.com/appbGqvufDAWCGhHt/pagNNgAB0Gmk9eEUw/form__;!!OToaGQ!uTOLWvujpA-zomUgetPUhJ7jgQVYQJvs2MX3cfIa0-p3CApd4njiOQZvP9LvrT9LIMZDHUmPVYNYx7SsMITUg4cpWShg$';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams/duke'
        );
        const teamData = response.data.team;

        let record = teamData.record.items[0].summary || '0-0';
        let standing = teamData.standingSummary || '';
        let nextOpponent = '';
        let rank = teamData.rank || '';

        const homeTeam = teamData.nextEvent[0].competitions[0].competitors[0].team.displayName;
        const awayTeam = teamData.nextEvent[0].competitions[0].competitors[1].team.displayName;
        nextOpponent = homeTeam === "Duke Blue Devils" ? awayTeam : homeTeam;

        let numTents = 0; // Fetch this value later

        setData({ record, standing, nextOpponent, rank, numTents });
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const fetchTentsCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/tent-checks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const tents = response.data;
        setData(prevData => ({ ...prevData, numTents: tents.length }));
      } catch (error) {
        console.error('Error fetching tent count:', error);
      }
    };

    fetchTentsCount();
  }, []);

  return (
    <>
    <div className="all-of-home">
        <div className="bubble-container">
        <div className="header">
            <img src={bannerImage} alt="Kville Nation Banner" />
        </div>
        </div>

        <div className="bubble-container">
            <div className="stats-row">
                <div className="stat-box">
                <div>AP RANK</div>
                <div className='dukeStats'>{data.rank}</div>
                </div>
                <div className="stat-box">
                <div>RECORD</div>
                <div className='dukeStats'>{data.record}</div>
                </div>
                <div className="stat-box">
                <div>STANDING</div>
                <div className='dukeStats'>{data.standing}</div>
                </div>
                <div className="stat-box">
                <div>NEXT OPPONENT</div>
                <div className='dukeStats'>{data.nextOpponent}</div>
                </div>
                <div className="stat-box">
                <div>NUMBER OF TENTS IN K-VILLE</div>
                <div className='dukeStats'>{data.numTents}</div>
                </div>
            </div>
        </div>
        <div className="content-row"> 
          <div className="bubble-container">
            <button className="register-button" onClick={handleRegisterClick}>
              Register a Tent!
            </button>
          </div>
          <div className="bubble-container-spotify">
            <SpotifyEmbed />
          </div>
        </div>
        <div className="embeds-row"> 
        <div className="final-home-row">
          <InstagramEmbedKvilleNation />
        </div>
        <div className='final-home-row'>
          <InstagramEmbedDukeMBB />
        </div>
      </div>
    </div>
    </>
    );
};
    
export default Home;
