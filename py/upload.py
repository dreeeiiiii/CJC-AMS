import pandas as pd
import bcrypt
from sqlalchemy import create_engine, text

# Your Neon connection string
DATABASE_URL = "postgresql://neondb_owner:npg_ByDe0ouNHkc2@ep-bold-lake-a10aqox5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Paths to your CSV files
MEMBERS_PATH = r"C:\Users\dreiiiii\Downloads\Members.csv"
ATTENDANCE_PATH = r"C:\Users\dreiiiii\Downloads\Attendanceso.csv"

# Default password that all users will have
DEFAULT_PASSWORD = "newmember"

def hash_password(password):
    """Hash a password using bcrypt"""
    # Convert string to bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash (10 rounds is standard)
    salt = bcrypt.gensalt(rounds=10)
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string
    return hashed.decode('utf-8')

print("Starting import to Neon...")
print("=" * 50)

try:
    # Read Members
    print("\n📖 Reading Members.csv...")
    members_df = pd.read_csv(MEMBERS_PATH)
    print(f"   Found {len(members_df)} members")
    
    # Show first password before hashing (for verification)
    print(f"\n   Example password before hashing: {members_df['password'].iloc[0][:30]}...")
    
    # Hash all passwords (replace placeholders with real bcrypt hashes)
    print("\n🔐 Hashing passwords with bcrypt...")
    members_df['password'] = hash_password(DEFAULT_PASSWORD)
    print(f"   All {len(members_df)} passwords hashed using '{DEFAULT_PASSWORD}'")
    
    # Show first password after hashing
    print(f"   Example after hashing: {members_df['password'].iloc[0][:30]}...")
    
    # Keep original IDs (don't drop them - needed for attendance foreign keys)
    print("   Keeping original IDs for foreign key references")
    
    # Create database engine
    engine = create_engine(DATABASE_URL)
    
    # Clear existing data first (to avoid conflicts)
    with engine.connect() as conn:
        print("\n🗑️  Clearing existing data...")
        conn.execute(text("TRUNCATE TABLE \"Attendance\" CASCADE"))
        conn.execute(text("TRUNCATE TABLE \"Member\" CASCADE"))
        conn.commit()
        print("   Existing data cleared")
    
    # Import Members with hashed passwords
    print("\n📤 Importing members to Neon...")
    members_df.to_sql('Member', engine, if_exists='append', index=False)
    print(f"   ✅ Imported {len(members_df)} members with real bcrypt hashed passwords")
    
    # Read Attendance
    print("\n📖 Reading Attendance.csv...")
    attendance_df = pd.read_csv(ATTENDANCE_PATH)
    print(f"   Found {len(attendance_df)} attendance records")
    
    # Import attendance
    print("\n📤 Importing attendance records to Neon...")
    attendance_df.to_sql('Attendance', engine, if_exists='append', index=False)
    print(f"   ✅ Imported {len(attendance_df)} attendance records")
    
    # Verify the import
    print("\n" + "=" * 50)
    print("VERIFICATION")
    print("=" * 50)
    
    with engine.connect() as conn:
        # Check member count
        member_count = conn.execute(text("SELECT COUNT(*) FROM \"Member\"")).scalar()
        print(f"📊 Total members in database: {member_count}")
        
        # Check attendance count
        attendance_count = conn.execute(text("SELECT COUNT(*) FROM \"Attendance\"")).scalar()
        print(f"📊 Total attendance records: {attendance_count}")
        
        # Show sample members with password verification
        sample = conn.execute(text("SELECT id, \"firstName\", \"lastName\", email, password FROM \"Member\" LIMIT 2"))
        print("\n📋 Sample members with password hashes:")
        for row in sample:
            print(f"   ID: {row.id} | Name: {row.firstName} {row.lastName}")
            print(f"   Email: {row.email}")
            print(f"   Password hash: {row.password[:40]}...")
            
            # Verify the password works
            if bcrypt.checkpw(DEFAULT_PASSWORD.encode('utf-8'), row.password.encode('utf-8')):
                print(f"   ✅ Password verification: SUCCESS (password is '{DEFAULT_PASSWORD}')")
            else:
                print(f"   ❌ Password verification: FAILED")
            print()
    
    print("=" * 50)
    print("🎉 IMPORT COMPLETE!")
    print(f"📝 All users can login with password: '{DEFAULT_PASSWORD}'")
    print("=" * 50)
    
except FileNotFoundError as e:
    print(f"\n❌ File not found: {e}")
    print("Make sure your CSV files are in C:\\Users\\dreiiiii\\Downloads\\")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()