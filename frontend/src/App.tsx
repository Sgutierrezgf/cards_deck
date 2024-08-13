import { useEffect, useState } from "react";
import { debounce } from "lodash";
import "./App.css";

interface ImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
}

interface Card {
  id: string;
  name: string;
  set_name: string;
  image_uris: ImageUris;
  prints_search_uri: string;
}

function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [card, setCard] = useState<Card | null>(null);
  const [prints, setPrints] = useState<Card[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const debouncedFetchCard = debounce(async (query: string) => {
      setError(null);
      try {
        const response = await fetch(
          `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
            query
          )}`
        );
        if (!response.ok) {
          throw new Error("Carta no encontrada");
        }
        const data = await response.json();
        setCard(data);

        const printsResponse = await fetch(data.prints_search_uri);
        if (!printsResponse.ok) {
          throw new Error("Error al buscar impresiones");
        }
        const printsData = await printsResponse.json();
        setPrints(printsData.data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Error desconocido al buscar la carta.");
        }
        setCard(null);
        setPrints([]);
      }
    }, 300);

    if (searchQuery.length > 1) {
      debouncedFetchCard(searchQuery);
    } else {
      setCard(null);
      setPrints([]);
    }

    // Cleanup debounce function on component unmount
    return () => {
      debouncedFetchCard.cancel();
    };
  }, [searchQuery]); // No incluir debouncedFetchCard en dependencias

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      <h1>Buscar Carta de Magic: The Gathering</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Nombre de la carta"
        autoComplete="off"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {card && (
        <div>
          <h2>{card.name}</h2>
          <h3>Impresiones</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {prints.map((print) => (
              <div key={print.id}>
                <h4>{print.set_name}</h4>
                {print.image_uris ? (
                  <img
                    src={print.image_uris.normal}
                    alt={print.name}
                    style={{ maxWidth: "200px" }}
                  />
                ) : (
                  <p>No image available</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
