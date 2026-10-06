import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { useStudents } from '../../context/StudentContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Building2, BedDouble, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export const RoomOccupancyWidget = ({ floorFilter = null }) => {
  const { visibleStudents, students } = useStudents();
  const [occupancyMap, setOccupancyMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateOccupancy();
  }, [visibleStudents, students, floorFilter]);

  const calculateOccupancy = async () => {
    setLoading(true);
    try {
      const data = await studentService.getOccupancy(floorFilter);
      setOccupancyMap(data);
    } catch (err) {
      console.warn('Failed to calculate occupancy map:', err);
    } finally {
      setLoading(false);
    }
  };

  const list = Object.values(occupancyMap);

  return (
    <Card hover={true} className="shadow-soft-md border-l-4 border-l-gold-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#4A4A4A] flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-gold-600" />
            Room Occupancy Dashboard
          </h3>
          <p className="text-xs text-gray-500">
            Live occupancy & remaining bed availability (Max 2 students / room)
          </p>
        </div>
        <Badge variant="gold" size="sm" className="font-bold">
          Rule: Max 2 Per Room
        </Badge>
      </div>

      {loading ? (
        <div className="p-6 text-center text-xs text-gray-400 animate-pulse">Calculating room occupancy...</div>
      ) : list.length === 0 ? (
        <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl">
          No room occupancy data available for current floor filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((item) => {
            const isFull = item.is_full;
            const available = item.available_slots;

            return (
              <div
                key={`${item.floor_number}_${item.room_number}`}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                  isFull
                    ? 'bg-red-50/50 border-red-200'
                    : available === 1
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#4A4A4A] text-sm">
                    Room {item.room_number}
                  </span>
                  <Badge variant={isFull ? 'danger' : available === 1 ? 'gold' : 'success'} size="sm">
                    {item.occupied}/2 Occupied
                  </Badge>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isFull ? 'bg-red-500' : available === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(item.occupied / 2) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-gray-500">Remaining Beds:</span>
                  <span
                    className={
                      isFull ? 'text-red-600 uppercase font-black' : available === 1 ? 'text-amber-700' : 'text-emerald-700'
                    }
                  >
                    {isFull ? 'FULL' : `${available} Bed ${available === 1 ? 'Available' : 'Available'}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
