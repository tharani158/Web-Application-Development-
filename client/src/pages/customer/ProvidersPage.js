import React, { useEffect, useState } from 'react';
import { fetchProviders } from '../../services/providerService';
import Spinner from '../../components/Spinner';

function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetchProviders();
        setProviders(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadProviders();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container py-5">
      <h2>Available Providers</h2>
      {providers.length === 0 ? (
        <div className="alert alert-warning mt-4">No providers are available yet. Please come back later.</div>
      ) : (
        <div className="row g-4 mt-3">
          {providers.map((provider) => (
            <div className="col-md-4" key={provider._id}>
              <div className="card shadow-sm h-100 p-4">
                <h5>{provider.providerName}</h5>
                <p>{provider.specialization}</p>
                <p>{provider.description || 'No description provided.'}</p>
                <div className="mt-auto">
                  <span className="badge bg-primary">{provider.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProvidersPage;
