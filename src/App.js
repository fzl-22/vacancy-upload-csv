import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'Acceptance_Percentage', direction: 'desc' });
  const [filters, setFilters] = useState({
    position: '',
    company: '',
    city: '',
    province: '',
    description: '',
    minAcceptance: ''
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setData(results.data);
          setFilteredData(results.data);
        }
      });
    }
  };

  useEffect(() => {
    let filtered = data.filter(row => {
      return (
        row.Position?.toLowerCase().includes(filters.position.toLowerCase()) &&
        row.Company_Name?.toLowerCase().includes(filters.company.toLowerCase()) &&
        row.City?.toLowerCase().includes(filters.city.toLowerCase()) &&
        row.Province?.toLowerCase().includes(filters.province.toLowerCase()) &&
        row.Job_Description?.toLowerCase().includes(filters.description.toLowerCase()) &&
        (filters.minAcceptance === '' || parseFloat(row.Acceptance_Percentage) >= parseFloat(filters.minAcceptance))
      );
    });
    
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (['Quota', 'Registered', 'Acceptance_Percentage'].includes(sortConfig.key)) {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    setFilteredData(filtered);
  }, [filters, data, sortConfig]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Vacancy Analysis Dashboard</h1>
        <div className="upload-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            id="csv-upload"
            className="file-input"
          />
          <label htmlFor="csv-upload" className="upload-btn">
            {data.length === 0 ? 'Upload CSV File' : 'Upload New CSV'}
          </label>
        </div>
        {data.length > 0 && <p>Total Vacancies: {filteredData.length}</p>}
      </header>

      {data.length > 0 && (
        <div className="filters">
        <input
          type="text"
          placeholder="Search Position..."
          value={filters.position}
          onChange={(e) => handleFilterChange('position', e.target.value)}
        />
        <input
          type="text"
          placeholder="Search Company..."
          value={filters.company}
          onChange={(e) => handleFilterChange('company', e.target.value)}
        />
        <input
          type="text"
          placeholder="Search City..."
          value={filters.city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
        />
        <input
          type="text"
          placeholder="Search Province..."
          value={filters.province}
          onChange={(e) => handleFilterChange('province', e.target.value)}
        />
        <input
          type="text"
          placeholder="Search Description..."
          value={filters.description}
          onChange={(e) => handleFilterChange('description', e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Acceptance %"
          value={filters.minAcceptance}
          onChange={(e) => handleFilterChange('minAcceptance', e.target.value)}
        />
        </div>
      )}

      {data.length === 0 ? (
        <div className="empty-state">
          <h2>No Data Available</h2>
          <p>Please upload a CSV file with vacancy data to get started.</p>
          <p>Expected format: Position, Company_Name, Job_Description, City, Province, Quota, Registered, Acceptance_Percentage, Registration_Start, Registration_End</p>
        </div>
      ) : (
        <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('Position')} className="sortable">
                Position {sortConfig.key === 'Position' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Company_Name')} className="sortable">
                Company {sortConfig.key === 'Company_Name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('City')} className="sortable">
                City {sortConfig.key === 'City' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Province')} className="sortable">
                Province {sortConfig.key === 'Province' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Quota')} className="sortable">
                Quota {sortConfig.key === 'Quota' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Registered')} className="sortable">
                Registered {sortConfig.key === 'Registered' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('Acceptance_Percentage')} className="sortable">
                Acceptance % {sortConfig.key === 'Acceptance_Percentage' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Registration Period</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>
                  <span 
                    className="position-link" 
                    onClick={() => setSelectedJob(row)}
                  >
                    {row.Position}
                  </span>
                </td>
                <td>{row.Company_Name}</td>
                <td>{row.City}</td>
                <td>{row.Province}</td>
                <td>{row.Quota}</td>
                <td>{row.Registered}</td>
                <td className="acceptance-rate">{row.Acceptance_Percentage}%</td>
                <td>{new Date(row.Registration_Start).toLocaleDateString()} - {new Date(row.Registration_End).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.Position}</h2>
              <button className="close-btn" onClick={() => setSelectedJob(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="job-info">
                <p><strong>Company:</strong> {selectedJob.Company_Name}</p>
                <p><strong>Location:</strong> {selectedJob.City}, {selectedJob.Province}</p>
                <p><strong>Quota:</strong> {selectedJob.Quota} positions</p>
                <p><strong>Registered:</strong> {selectedJob.Registered} applicants</p>
                <p><strong>Acceptance Rate:</strong> <span className="acceptance-rate">{selectedJob.Acceptance_Percentage}%</span></p>
                <p><strong>Registration Period:</strong> {new Date(selectedJob.Registration_Start).toLocaleDateString()} - {new Date(selectedJob.Registration_End).toLocaleDateString()}</p>
              </div>
              <div className="job-description">
                <h3>Job Description</h3>
                <p>{selectedJob.Job_Description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;