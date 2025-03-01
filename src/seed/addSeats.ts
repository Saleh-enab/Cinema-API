import db from "../db";

export async function addSeatsToHall(hallId: string): Promise<void> {
    try {
        console.log(`Adding 30 seats to hall ${hallId}...`);

        const rows = ['A', 'B', 'C'];
        const seatsPerRow = 10;
        const seatCreations = [];

        const hall = await db.hall.findUnique({
            where: { id: hallId }
        });

        if (!hall) {
            throw new Error(`Hall with ID ${hallId} does not exist`);
        }

        // Check if seats already exist for this hall
        const existingSeats = await db.seat.count({
            where: { hallId }
        });

        if (existingSeats > 0) {
            throw new Error(`Hall ${hallId} already has seats. Delete them first or use another hall.`);
        }

        // Generate seats for each row
        for (const row of rows) {
            for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
                const seatId = `${hallId} - ${row}${seatNumber}`;
                seatCreations.push(
                    db.seat.create({
                        data: {
                            id: seatId,
                            hallId: hallId,
                            row: row,
                            seatNumber: seatNumber
                        }
                    })
                );
            }
        }

        // Execute all seat creation operations in a transaction
        await db.$transaction(seatCreations);

        console.log(`Successfully added 30 seats to hall ${hallId}`);
    } catch (error) {
        console.error('Error adding seats to hall:', error);
        throw error;
    }
}

async function main() {
    try {
        const hallId = 'H2'; // Replace with your hall ID
        await addSeatsToHall(hallId);
        console.log('Seats added successfully');
    } catch (error) {
        console.error('Failed to add seats:', error);
    } finally {
        await db.$disconnect();
    }
}

main();