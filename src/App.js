import "./App.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { nDaysAgo } from "./utils";

const FavoriteButton = ({ row, updateData }) => {
  return (
    <button
      data-testid="favorite-button"
      onClick={() => updateData(row.id, "favorite", !row.favorite)}
    >
      {row.favorite ? `⭐` : `☆`}
    </button>
  );
};

const FavoritesCheckbox = ({ favorites, updateFilters }) => {
  return (
    <>
      <label htmlFor={"favorite"}>{`Filter only your Favorites `}</label>
      <input
        data-testid="favorite-checkbox"
        id="favorite"
        defaultChecked={favorites}
        type="checkbox"
        onChange={(e) => updateFilters("favorites", e.target.checked)}
      />
    </>
  );
};

const LanguageSelect = ({ languages, updateFilters }) => {
  return (
    <>
      <label htmlFor={"language"}>{"From "}</label>
      <select
        data-testid="language-select"
        id="language"
        defaultValue={"any"}
        onChange={(e) => updateFilters("language", e.target.value)}
      >
        <option key={0} value="any">
          Any language
        </option>
        {languages.map((language, i) => (
          <option key={i + 1} value={language}>
            {language}
          </option>
        ))}
      </select>
    </>
  );
};

const GitHubLink = ({ row }) => {
  return (
    <a href={row.html_url} rel="noopener noreferrer" target="_blank">
      {"link"}
    </a>
  );
};

const Table = ({ data, updateData, applyFilters, applySort }) => {
  const rows = Object.values(data).filter(applyFilters).sort(applySort);
  return !rows?.length ? (
    <p>No rows to display</p>
  ) : (
    <div className="App-table">
      <table data-testid="data-table">
        <thead>
          <tr>
            <th> </th>
            <th>Name</th>
            <th>Description</th>
            <th>Link</th>
            <th>Stars</th>
            <th>Favorite</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id}>
              <td>{i + 1}</td>
              <td>{row.name}</td>
              <td>{row.description}</td>
              <td>
                <GitHubLink row={row} />
              </td>
              <td>{row.stargazers_count}</td>
              <td>
                <FavoriteButton row={row} updateData={updateData} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Filters = ({ languages, filters, updateFilters }) => {
  return (
    <div className="App-filters">
      <FavoritesCheckbox
        favorites={filters.favorites}
        updateFilters={updateFilters}
      />
      <br />
      <LanguageSelect languages={languages} updateFilters={updateFilters} />
    </div>
  );
};

function App() {
  const sevenDaysAgo = nDaysAgo(7).toISOString().slice(0, 10);

  const gitHubUrl = `https://api.github.com/search/repositories?q=created:>${sevenDaysAgo}&sort=stars&order=desc`;

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [languages, setLanguages] = useState([]);
  const [filters, setFilters] = useState({ favorites: false, language: "any" });

  const updateData = (id, key, value) => {
    setData((prevState) => ({
      ...prevState,
      [id]: { ...prevState[id], [key]: value },
    }));
  };

  const updateFilters = (key, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const applyFilters = (r) => {
    return (
      (!filters.favorites || r.favorite) &&
      (filters.language === "any" || filters.language === r.language)
    );
  };

  const applySort = (a, b) => b.stargazers_count - a.stargazers_count;

  useEffect(() => {
    async function fetchData() {
      axios
        .get(gitHubUrl)
        .then((response) => {
          const data = Object.assign(
            {},
            ...response.data.items.map((obj) => ({
              [obj.id]: {
                ...obj,
                favorite: false,
                language: obj.language ?? "Undefined",
              },
            }))
          );
          setData(data);
          setLoading(false);
        })
        .catch((error) => {
          setError(error);
          console.error(error);
          setLoading(false);
        });
    }
    fetchData();
  }, [gitHubUrl]);

  useEffect(() => {
    setLanguages(
      Array.from(
        new Set(Object.values(data).map((item) => item.language))
      ).sort()
    );
  }, [data]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>{`Trending repositories on GitHub since ${sevenDaysAgo}`}</h1>
        <div className="App-tooltip">
          <h3>
          <span className="App-wave">👋</span> Hello <code>Veed.io</code>!
          </h3>
          <p className="tooltiptext">[You want to hire me...]</p>
        </div>
        <Filters
          languages={languages}
          filters={filters}
          updateFilters={updateFilters}
        />
      </header>
      <div className="App-body">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Something went wrong, check the log!</p>
          ) : (
            <Table
              data={data}
              updateData={updateData}
              applySort={applySort}
              applyFilters={applyFilters}
            />
          )}
      </div>
    </div>
  );
}

export default App;
