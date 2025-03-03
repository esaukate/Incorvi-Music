document.addEventListener('DOMContentLoaded', function() {
  // Navigation
  const topTracksLink = document.getElementById('top-tracks-link');
  const topArtistsLink = document.getElementById('top-artists-link');
  const playlistsLink = document.getElementById('playlists-link');
  const searchLink = document.getElementById('search-link');
  const backToPlaylistsBtn = document.getElementById('back-to-playlists');
  
  const sections = {
    topTracks: document.getElementById('top-tracks-section'),
    topArtists: document.getElementById('top-artists-section'),
    playlists: document.getElementById('playlists-section'),
    playlistDetail: document.getElementById('playlist-detail-section'),
    search: document.getElementById('search-section')
  };
  
  // Show a specific section and hide others
  function showSection(sectionName) {
    Object.keys(sections).forEach(key => {
      sections[key].classList.remove('active');
    });
    sections[sectionName].classList.add('active');
  }
  
  // Navigation event listeners
  if (topTracksLink) {
    topTracksLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection('topTracks');
      loadTopTracks('medium_term');
    });
  }
  
  if (topArtistsLink) {
    topArtistsLink.addEventListener('click', function(e) {
      e.preventDefault();
      showSection('topArtists');
      loadTopArtists('medium_term');
    });
  }
  
  if (playlistsLink) {
