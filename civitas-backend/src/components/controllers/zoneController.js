const Complaint = require('../../models/Complaint'); 
const Locality = require('../../models/Locality');
exports.getZoneData = async (req, res) => {
    try {
        const localities = await Locality.find().lean(); 

        const complaintCounts = await Complaint.aggregate([
            {
                $group: {
                    _id: '$locality', // Group by the 'locality' field in your complaint schema
                    complaintCount: { $sum: 1 },
                },
            },
        ]);

        // Step 3: Create a simple map for quick lookups of complaint counts.
        const countMap = new Map();
        complaintCounts.forEach(item => {
            countMap.set(item._id, item.complaintCount);
        });

        // Step 4: Combine the geographic data with the complaint data.
        const zoneFeatures = localities.map(locality => {
            const count = countMap.get(locality.name) || 0;
            let zoneColor = 'green'; // Default color is green

            // Define the thresholds for changing colors
            if (count > 30) {
                zoneColor = 'red';
            } else if (count > 10) {
                zoneColor = 'yellow';
            }

            // Format the final object into a standard GeoJSON Feature
            return {
                type: 'Feature',
                properties: {
                    name: locality.name,
                    complaintCount: count,
                    zoneColor: zoneColor,
                },
                geometry: locality.geometry,
            };
        });

        res.status(200).json(zoneFeatures);

    } catch (error) {
        console.error('Error fetching zone data:', error);
        res.status(500).json({ message: 'Server error while fetching zone data.' });
    }
};