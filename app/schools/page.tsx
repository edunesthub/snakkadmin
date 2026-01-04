'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PremiumLoading } from '../components/PremiumLoading';
import Image from 'next/image';

interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
  hostels: string[];
  createdAt?: Date;
}

interface Restaurant {
  id: string;
  name: string;
  image: string;
  locations?: string[];
  campus?: string;
  isStudent?: boolean;
}

export default function SchoolsPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedUniId, setExpandedUniId] = useState<string | null>(null);
  const [managingUniId, setManagingUniId] = useState<string | null>(null);
  const [studentOnly, setStudentOnly] = useState(false);
  const [editingUni, setEditingUni] = useState<University | null>(null);
  const [editFormData, setEditFormData] = useState<University | null>(null);
  const [deletingUniId, setDeletingUniId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uniSnapshot, restSnapshot] = await Promise.all([
        getDocs(collection(db, 'universities')),
        getDocs(collection(db, 'restaurants'))
      ]);
      
      const uniData: University[] = uniSnapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          name: raw.name || 'Untitled University',
          shortName: raw.shortName || '',
          city: raw.city || '',
          hostels: Array.isArray(raw.hostels) ? raw.hostels : [],
          createdAt: raw.createdAt?.toDate(),
        };
      });
      
      const restData: Restaurant[] = restSnapshot.docs.map((doc) => {
        const raw = doc.data();
        return {
          id: doc.id,
          name: raw.name || 'Untitled Restaurant',
          image: raw.image || '/placeholder.png',
          locations: Array.isArray(raw.locations) ? raw.locations : [],
          campus: raw.campus || '',
          isStudent: raw.isStudent || false,
        };
      });
      
      setUniversities(uniData);
      setRestaurants(restData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRestaurantsForUni = (uni: University): Restaurant[] => {
    return restaurants.filter((rest) => {
      // Match by campus shortName
      const matchesCampus = rest.campus?.toLowerCase() === uni.shortName.toLowerCase();
      // Match if any hostel from uni is in restaurant's locations
      const matchesHostel = uni.hostels.some((hostel) => 
        rest.locations?.some(loc => loc.toLowerCase() === hostel.toLowerCase())
      );
      // Match if university shortName or full name is in locations
      const matchesUniName = rest.locations?.some(loc => 
        loc.toLowerCase() === uni.shortName.toLowerCase() || 
        loc.toLowerCase().includes(uni.name.toLowerCase())
      );
      return matchesCampus || matchesHostel || matchesUniName;
    });
  };

  const getUnassignedRestaurants = (uni: University): Restaurant[] => {
    const assigned = getRestaurantsForUni(uni);
    return restaurants.filter(rest => !assigned.find(a => a.id === rest.id));
  };

  const toggleRestaurantAssignment = async (restaurant: Restaurant, uni: University, isCurrentlyAssigned: boolean) => {
    try {
      const restRef = doc(db, 'restaurants', restaurant.id);
      let newLocations = [...(restaurant.locations || [])];
      
      if (isCurrentlyAssigned) {
        // Remove all hostels and uni identifiers
        newLocations = newLocations.filter(loc => {
          const locLower = loc.toLowerCase();
          const matchesHostel = uni.hostels.some(h => h.toLowerCase() === locLower);
          const matchesUni = locLower === uni.shortName.toLowerCase() || locLower.includes(uni.name.toLowerCase());
          return !matchesHostel && !matchesUni;
        });
      } else {
        // Add university shortName if not present
        if (!newLocations.some(loc => loc.toLowerCase() === uni.shortName.toLowerCase())) {
          newLocations.push(uni.shortName);
        }
      }
      
      await updateDoc(restRef, { locations: newLocations });
      await fetchData();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Failed to update restaurant assignment');
    }
  };

  const toggleExpand = (uniId: string) => {
    setExpandedUniId(expandedUniId === uniId ? null : uniId);
  };

  const openEditModal = (uni: University) => {
    setEditingUni(uni);
    setEditFormData({ ...uni });
  };

  const closeEditModal = () => {
    setEditingUni(null);
    setEditFormData(null);
  };

  const saveEditedUni = async () => {
    if (!editFormData) return;
    try {
      const uniRef = doc(db, 'universities', editFormData.id);
      await updateDoc(uniRef, {
        name: editFormData.name,
        shortName: editFormData.shortName,
        city: editFormData.city,
        hostels: editFormData.hostels,
      });
      await fetchData();
      closeEditModal();
    } catch (error) {
      console.error('Error updating university:', error);
      alert('Failed to update university');
    }
  };

  const deleteUniversity = async (uniId: string) => {
    if (!confirm('Are you sure? This will unassign all restaurants from this university.')) return;
    try {
      // Remove university from all restaurants' locations
      const restToUpdate = restaurants.filter(r => 
        r.locations?.some(loc => {
          const uni = universities.find(u => u.id === uniId);
          return uni && (loc.toLowerCase() === uni.shortName.toLowerCase());
        })
      );
      
      for (const rest of restToUpdate) {
        const uni = universities.find(u => u.id === uniId);
        if (uni) {
          const newLocs = rest.locations?.filter(loc => loc.toLowerCase() !== uni.shortName.toLowerCase()) || [];
          await updateDoc(doc(db, 'restaurants', rest.id), { locations: newLocs });
        }
      }

      // Delete university
      await deleteDoc(doc(db, 'universities', uniId));
      await fetchData();
      setDeletingUniId(null);
    } catch (error) {
      console.error('Error deleting university:', error);
      alert('Failed to delete university');
    }
  };

  const removeHostel = (hostelName: string) => {
    if (!editFormData) return;
    setEditFormData({
      ...editFormData,
      hostels: editFormData.hostels.filter(h => h !== hostelName),
    });
  };

  const addHostel = (hostelName: string) => {
    if (!editFormData || !hostelName.trim()) return;
    if (editFormData.hostels.includes(hostelName)) {
      alert('Hostel already exists');
      return;
    }
    setEditFormData({
      ...editFormData,
      hostels: [...editFormData.hostels, hostelName],
    });
  };

  if (loading) {
    return <PremiumLoading />;
  }

  const filteredUniversities = universities.filter((uni) => {
    const haystack = `${uni.name} ${uni.shortName} ${uni.city} ${uni.hostels.join(' ')}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());
    if (!matchesSearch) return false;
    
    if (studentOnly) {
      const uniRestaurants = getRestaurantsForUni(uni);
      return uniRestaurants.some(r => r.isStudent === true);
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 min-h-full animate-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Schools & Universities</h1>
          <p className="text-gray-400 text-sm mt-1">Manage universities, hostels, and their restaurant assignments.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schools or hostels"
            className="flex-1 px-4 py-3 bg-[#0a0a0f] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-600"
          />
          <label className="inline-flex items-center gap-2 text-sm text-white bg-white/5 border border-white/10 px-3 py-2 rounded-xl cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={studentOnly}
              onChange={(e) => setStudentOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-black/40 border-gray-600 rounded focus:ring-blue-500"
            />
            <span>🎓 Student only</span>
          </label>
        </div>
      </div>

      {filteredUniversities.length === 0 ? (
        <div className="glass-card rounded-2xl p-6 text-center text-gray-400 border border-white/5">
          No universities match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUniversities.map((uni) => {
            const uniRestaurants = getRestaurantsForUni(uni);
            const unassignedRestaurants = getUnassignedRestaurants(uni);
            const isExpanded = expandedUniId === uni.id;
            const isManaging = managingUniId === uni.id;
            
            return (
              <div key={uni.id} className="glass-card rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{uni.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {uni.shortName && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300">
                            {uni.shortName}
                          </span>
                        )}
                        {uni.city && (
                          <span className="text-xs text-gray-400">📍 {uni.city}</span>
                        )}
                        <span className="text-xs text-gray-500">
                          • {uniRestaurants.length} restaurant{uniRestaurants.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl" aria-hidden>
                      🎓
                    </span>
                  </div>
                  
                  <div className="border-t border-white/5 pt-4 mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Hostels ({uni.hostels.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uni.hostels.length > 0 ? (
                        uni.hostels.map((hostel, idx) => (
                          <span key={idx} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200">
                            {hostel}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No hostels listed</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => toggleExpand(uni.id)}
                      className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all"
                    >
                      <span className="text-sm font-medium">
                        {isExpanded ? 'Hide' : 'Show'} Restaurants ({uniRestaurants.length})
                      </span>
                      <svg 
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setManagingUniId(isManaging ? null : uni.id)}
                      className={`px-6 py-3 rounded-xl border font-medium transition-all ${
                        isManaging 
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' 
                          : 'bg-white/5 hover:bg-white/10 border-white/5 text-white'
                      }`}
                    >
                      {isManaging ? 'Done' : 'Manage'}
                    </button>
                    <button
                      onClick={() => openEditModal(uni)}
                      className="px-6 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                      title="Edit university"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => setDeletingUniId(uni.id)}
                      className="px-6 py-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium transition-all"
                      title="Delete university"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 bg-white/5 p-6">
                    {uniRestaurants.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-4">
                        No restaurants assigned to this university yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uniRestaurants.map((rest) => (
                          <div 
                            key={rest.id} 
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/5 hover:border-white/10 transition-all group"
                          >
                            <div className="relative h-12 w-12 shrink-0">
                              <Image
                                src={rest.image}
                                alt={rest.name}
                                fill
                                className="rounded-lg object-cover ring-2 ring-white/10"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{rest.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rest.locations && rest.locations.length > 0 && (
                                  <span className="text-[10px] text-gray-400 truncate">
                                    {rest.locations.slice(0, 2).join(', ')}
                                    {rest.locations.length > 2 ? ` +${rest.locations.length - 2}` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isManaging && (
                              <button
                                onClick={() => toggleRestaurantAssignment(rest, uni, true)}
                                className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                title="Remove from university"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isManaging && (
                  <div className="border-t border-white/5 bg-blue-500/5 p-6">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                      Add Restaurants ({unassignedRestaurants.length} available)
                    </h4>
                    {unassignedRestaurants.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-4">
                        All restaurants are already assigned.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {unassignedRestaurants.map((rest) => (
                          <button
                            key={rest.id}
                            onClick={() => toggleRestaurantAssignment(rest, uni, false)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0f] border border-white/10 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left"
                          >
                            <div className="relative h-10 w-10 shrink-0">
                              <Image
                                src={rest.image}
                                alt={rest.name}
                                fill
                                className="rounded-lg object-cover ring-2 ring-white/10"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{rest.name}</p>
                              <p className="text-[10px] text-gray-500">Click to add</p>
                            </div>
                            <span className="text-green-400 text-xl shrink-0">+</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit University Modal */}
      {editingUni && editFormData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card rounded-2xl border border-white/10 w-full max-w-2xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
            <div className="flex-shrink-0 p-6 md:p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-white">Edit University</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white transition-colors text-2xl flex-shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-5 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  placeholder="University name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Short Name</label>
                <input
                  type="text"
                  value={editFormData.shortName}
                  onChange={(e) => setEditFormData({ ...editFormData, shortName: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  placeholder="Short name (e.g., UoN)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                <input
                  type="text"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  className="w-full px-4 py-3 md:py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                  placeholder="City"
                />
              </div>

              <div className="border-t border-white/10 pt-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Hostels ({editFormData.hostels.length})
                </label>
                <div className="space-y-3 mb-4">
                  {editFormData.hostels.length > 0 ? (
                    editFormData.hostels.map((hostel) => (
                      <div
                        key={hostel}
                        className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3 md:py-2"
                      >
                        <span className="text-white text-base md:text-sm">{hostel}</span>
                        <button
                          onClick={() => removeHostel(hostel)}
                          className="text-red-400 hover:text-red-300 transition-colors text-lg"
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm py-3 text-center">No hostels added yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="hostelInput"
                    placeholder="Add new hostel"
                    className="flex-1 px-4 py-3 md:py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        addHostel(input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('hostelInput') as HTMLInputElement;
                      addHostel(input.value);
                      input.value = '';
                    }}
                    className="px-6 py-3 md:py-2 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors font-medium text-base"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 flex-shrink-0 p-6 md:p-8 border-t border-white/10 bg-white/5">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-3 md:py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all text-base md:text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedUni}
                className="flex-1 px-4 py-3 md:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all text-base md:text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUniId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl border border-white/10 max-w-sm w-full p-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-4xl mb-4 text-center">🗑</div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Delete University?</h2>
            <p className="text-gray-400 text-center mb-6">
              This action cannot be undone. All restaurants will be unassigned from this university.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingUniId(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUniversity(deletingUniId)}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
