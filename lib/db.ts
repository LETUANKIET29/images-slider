import { createClient } from '@libsql/client';

const url = 'libsql://k2a1-letuankiet29.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDc5NjY5OTMsImlkIjoiMzI0NWYxNTAtNzAwZC00MTM2LWEzMjYtNWU4ODMwY2MxYTU1IiwicmlkIjoiODg0YjA1M2YtNWRjMy00YmRjLTkzZmMtOGQ3NzhhOTE5MmE4In0.aIzIP_ojsttEHo2sX7VDCU06HFKgIQW3Bft1-P5E6aP7PpjbvqST_x5uv3hNKwIsmq18ceSk9zw5gEiX4tq-Bw';

export const db = createClient({
  url,
  authToken,
});

// Test the connection
export async function testConnection() {
  try {
    const result = await db.execute('SELECT 1');
    console.log('Connected! Result:', result);
    return result;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
}

// Initialize database schema
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing Turso database schema...")

    if (!db) {
      throw new Error("Turso client is not initialized")
    }

    // Create nature_slides table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nature_slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        src TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert initial data if table is empty
    const countResult = await db.execute('SELECT COUNT(*) as count FROM nature_slides');
    if (countResult.rows[0].count === 0) {
      const initialSlides = [
        {
          title: "FINLA",
          src: "https://wallpapercave.com/wp/wp2506793.jpg"
        },
        {
          title: "TERRA",
          src: "https://wallpapercave.com/wp/wp2506795.jpg"
        },
        {
          title: "AQUA",
          src: "https://wallpapercave.com/wp/wp2506811.jpg"
        }
      ];

      for (const slide of initialSlides) {
        await db.execute(`
          INSERT INTO nature_slides (title, src)
          VALUES (?, ?)
        `, [slide.title, slide.src]);
      }
    }

    console.log("✅ Turso database initialization successful")
    return {
      success: true,
      message: "Database initialized successfully"
    }
  } catch (error) {
    console.error("❌ Turso database initialization failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to initialize database"
    }
  }
}

// Get all nature slides
export async function getAllNatureSlides() {
  try {
    const result = await db.execute('SELECT * FROM nature_slides ORDER BY id');
    return {
      success: true,
      data: result.rows
    };
  } catch (error) {
    console.error("Failed to get nature slides:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get nature slides"
    };
  }
}

// Reset and reinitialize nature slides
export async function resetNatureSlides() {
  try {
    console.log("🔄 Resetting nature slides...")
    
    // Drop the existing table
    await db.execute('DROP TABLE IF EXISTS nature_slides')
    
    // Create the table again
    await db.execute(`
      CREATE TABLE IF NOT EXISTS nature_slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        src TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert new data
    const newSlides = [
      {
        title: "MOUNTAIN",
        src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070"
      },
      {
        title: "OCEAN",
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073"
      },
      {
        title: "FOREST",
        src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071"
      },
      {
        title: "DESERT",
        src: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=2076"
      },
      {
        title: "LAKE",
        src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070"
      }
    ]

    for (const slide of newSlides) {
      await db.execute(`
        INSERT INTO nature_slides (title, src)
        VALUES (?, ?)
      `, [slide.title, slide.src])
    }

    console.log("✅ Nature slides reset successful")
    return {
      success: true,
      message: "Nature slides reset successfully"
    }
  } catch (error) {
    console.error("❌ Failed to reset nature slides:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset nature slides"
    }
  }
}

// Rest of the functions remain the same but with improved error handling...
export async function getAllUsers() {
  try {
    console.log("🔄 Getting all users...")
    const result = await db.execute(`SELECT * FROM users ORDER BY created_at DESC`)
    console.log(`✅ Retrieved ${result.rows.length} users`)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error("❌ Failed to get users:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get users",
      details: error,
    }
  }
}

export async function addUser(name: string, email: string) {
  try {
    console.log("🔄 Adding new user:", { name, email })
    const result = await db.execute(`
      INSERT INTO users (name, email) 
      VALUES (${name}, ${email}) 
      RETURNING *
    `)
    console.log("✅ User added successfully:", result.rows[0])
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("❌ Failed to add user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add user",
      details: error,
    }
  }
}

export async function getUserById(id: number) {
  try {
    console.log("🔄 Getting user by ID:", id)
    const result = await db.execute(`SELECT * FROM users WHERE id = ${id}`)

    if (result.rows.length === 0) {
      return { success: false, error: "User not found" }
    }

    console.log("✅ User found:", result.rows[0])
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("❌ Failed to get user by ID:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
      details: error,
    }
  }
}

export async function updateUser(id: number, name: string, email: string) {
  try {
    console.log("🔄 Updating user:", { id, name, email })
    const result = await db.execute(`
      UPDATE users 
      SET name = ${name}, email = ${email} 
      WHERE id = ${id} 
      RETURNING *
    `)

    if (result.rows.length === 0) {
      return { success: false, error: "User not found" }
    }

    console.log("✅ User updated successfully:", result.rows[0])
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("❌ Failed to update user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
      details: error,
    }
  }
}

export async function deleteUser(id: number) {
  try {
    console.log("🔄 Deleting user:", id)
    const result = await db.execute(`DELETE FROM users WHERE id = ${id} RETURNING id`)

    if (result.rows.length === 0) {
      return { success: false, error: "User not found" }
    }

    console.log("✅ User deleted successfully")
    return { success: true, message: "User deleted successfully" }
  } catch (error) {
    console.error("❌ Failed to delete user:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
      details: error,
    }
  }
}

export async function searchUsers(query: string) {
  try {
    console.log("🔄 Searching users with query:", query)
    const result = await db.execute(`
      SELECT * FROM users 
      WHERE name ILIKE ${`%${query}%`} 
         OR email ILIKE ${`%${query}%`}
      ORDER BY created_at DESC
    `)
    console.log(`✅ Found ${result.rows.length} users matching query`)
    return { success: true, data: result.rows }
  } catch (error) {
    console.error("❌ Failed to search users:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to search users",
      details: error,
    }
  }
}

export async function getUsersWithPagination(page = 1, limit = 10) {
  try {
    console.log("🔄 Getting paginated users:", { page, limit })
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await db.execute(`SELECT COUNT(*) as total FROM users`)
    const total = Number(countResult.rows[0].total)

    // Get paginated results
    const result = await db.execute(`
      SELECT * FROM users 
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `)

    console.log(`✅ Retrieved ${result.rows.length} users (page ${page})`)
    return {
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }
  } catch (error) {
    console.error("❌ Failed to get paginated users:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get users",
      details: error,
    }
  }
}
