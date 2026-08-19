import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    User, UserRole, MissingPerson, UnidentifiedPerson, 
    CaseStatus, ImageEmbedding, PotentialMatch, MatchStatus, Notification, AuditLog
)
from app.services.auth_service import get_password_hash
from app.matching.feature_extractor import extract_image_embedding
from app.matching.hybrid_matcher import compute_hybrid_match_score

def generate_svg_avatar(name: str, bg_color: str, fg_color: str, gender_style: str = "child") -> str:
    """Generates clean inline Base64 Data URI SVG portrait avatar for synthetic records."""
    initials = "".join([part[0] for part in name.split()[:2]]).upper()
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" rx="30" fill="{bg_color}"/>
      <circle cx="100" cy="75" r="40" fill="{fg_color}" opacity="0.9"/>
      <path d="M40 170 C40 125, 160 125, 160 170 Z" fill="{fg_color}" opacity="0.9"/>
      <text x="100" y="85" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">{initials}</text>
    </svg>"""
    import base64
    b64 = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
    return f"data:image/svg+xml;base64,{b64}"

def seed_database(db: Session):
    """Populates database with synthetic seed dataset for the Expo demonstration."""
    # Check if already seeded
    if db.query(User).filter(User.email == "police@findback.demo").first():
        print("Database already contains demo seed data.")
        return

    print("Seeding FIND-BACK AI database with synthetic records...")

    # 1. Create Demo Users
    demo_password_hash = get_password_hash("Demo@123")
    
    police_user = User(
        name="Officer Rajesh Kumar",
        email="police@findback.demo",
        password_hash=demo_password_hash,
        role=UserRole.POLICE,
        organization="Vijayawada Law Enforcement Command",
        phone="+91 98765 43210"
    )
    ngo_user = User(
        name="Anita Sharma (Hope Shelter)",
        email="ngo@findback.demo",
        password_hash=demo_password_hash,
        role=UserRole.NGO,
        organization="Asha Shelter & Relief Network",
        phone="+91 98765 12345"
    )
    admin_user = User(
        name="System Administrator",
        email="admin@findback.demo",
        password_hash=demo_password_hash,
        role=UserRole.ADMIN,
        organization="FindBack AI Platform Oversight",
        phone="+91 90000 00000"
    )
    
    db.add_all([police_user, ngo_user, admin_user])
    db.commit()

    # Colors for avatar generation
    colors = [
        ("#1e293b", "#38bdf8"), ("#0f172a", "#818cf8"), ("#172554", "#60a5fa"),
        ("#14532d", "#4ade80"), ("#4c1d95", "#c084fc"), ("#701a75", "#f472b6"),
        ("#7c2d12", "#fb923c"), ("#312e81", "#a78bfa")
    ]

    # Target Cities & Coordinates around Demo Region
    locations = [
        ("Vijayawada Central", 16.5062, 80.6480),
        ("Vijayawada Railway Station", 16.5170, 80.6272),
        ("Benz Circle, Vijayawada", 16.5000, 80.6500),
        ("Guntur Market Yard", 16.3067, 80.4365),
        ("Visakhapatnam Beach Road", 17.6868, 83.2185),
        ("Hyderabad Secunderabad", 17.4399, 78.4983),
        ("Tirupati Bus Station", 13.6288, 79.4192),
        ("Kakinada Port Area", 16.9891, 82.2475)
    ]

    # Guaranteed Matching Demo Pairs (8 Pairs for Expo Demo)
    matching_pairs_data = [
        {"name": "Aarav Sharma", "age": 10, "loc": locations[0], "missing_days": 12, "desc": "Wearing blue school uniform, brown eyes"},
        {"name": "Ananya Reddy", "age": 14, "loc": locations[1], "missing_days": 5, "desc": "Red backpack, yellow hairband"},
        {"name": "Kiran Verma", "age": 9, "loc": locations[2], "missing_days": 18, "desc": "Black jacket, white sneakers"},
        {"name": "Lakshmi Narayana", "age": 72, "loc": locations[3], "missing_days": 8, "desc": "Elderly male, memory impairment, grey shirt"},
        {"name": "Priya Das", "age": 12, "loc": locations[4], "missing_days": 2, "desc": "Green frock, small scar on left cheek"},
        {"name": "Rohan Gupta", "age": 15, "loc": locations[5], "missing_days": 25, "desc": "Grey hoodie, denim jeans"},
        {"name": "Sita Ram", "age": 68, "loc": locations[6], "missing_days": 14, "desc": "Elderly female, specs, maroon saree"},
        {"name": "Vikram Singh", "age": 11, "loc": locations[7], "missing_days": 9, "desc": "Striped t-shirt, black cap"}
    ]

    created_missing_records = []
    created_unidentified_records = []

    # 2. Seed 60 Missing Persons Records
    first_names = ["Aditya", "Bhavya", "Chaitanya", "Deepika", "Eshwar", "Farhan", "Gautam", "Harini", "Ishaan", "Jyoti", "Kavya", "Lokesh", "Meera", "Nikhil", "Omkar", "Pooja", "Rahul", "Sai", "Tanya", "Umesh", "Varun", "Yash", "Zoya"]
    last_names = ["Rao", "Chowdary", "Patel", "Nair", "Kulkarni", "Sharma", "Joshi", "Verma", "Sen", "Naidu"]

    for i in range(60):
        if i < len(matching_pairs_data):
            pair_info = matching_pairs_data[i]
            m_name = pair_info["name"]
            m_age = pair_info["age"]
            loc_name, lat, lng = pair_info["loc"]
            m_date = (datetime.utcnow() - timedelta(days=pair_info["missing_days"])).strftime("%Y-%m-%d")
        else:
            m_name = f"{random.choice(first_names)} {random.choice(last_names)}"
            m_age = random.choice([7, 9, 11, 13, 15, 22, 28, 35, 64, 71, 78])
            loc_tuple = random.choice(locations)
            # Add small random offset for realistic clustering
            lat = loc_tuple[1] + random.uniform(-0.03, 0.03)
            lng = loc_tuple[2] + random.uniform(-0.03, 0.03)
            loc_name = loc_tuple[0]
            m_date = (datetime.utcnow() - timedelta(days=random.randint(1, 45))).strftime("%Y-%m-%d")

        bg, fg = colors[i % len(colors)]
        photo_svg = generate_svg_avatar(m_name, bg, fg)
        
        m_person = MissingPerson(
            photo_url=photo_svg,
            name=m_name,
            age=m_age,
            date_of_birth=f"{2026-m_age}-05-15",
            missing_date=m_date,
            missing_location=loc_name,
            latitude=lat,
            longitude=lng,
            guardian_name=f"Parent of {m_name.split()[0]}",
            guardian_phone=f"+91 98765 {10000 + i}",
            status=CaseStatus.ACTIVE,
            created_by=police_user.id
        )
        db.add(m_person)
        created_missing_records.append((m_person, bg, fg))

    db.commit()

    # 3. Seed 40 Unidentified Persons Records
    for i in range(40):
        if i < len(matching_pairs_data):
            pair_info = matching_pairs_data[i]
            corresponding_missing = created_missing_records[i][0]
            u_age = pair_info["age"]
            loc_name, lat, lng = pair_info["loc"]
            # Use matching colors/svg seed so visual similarity is high for demo!
            bg, fg = created_missing_records[i][1], created_missing_records[i][2]
            u_photo_svg = generate_svg_avatar(corresponding_missing.name, bg, fg)
            u_name = f"Found near {loc_name}"
            u_details = f"Identified matching features: {pair_info['desc']}. Found sitting near public shelter."
        else:
            loc_tuple = random.choice(locations)
            lat = loc_tuple[1] + random.uniform(-0.02, 0.02)
            lng = loc_tuple[2] + random.uniform(-0.02, 0.02)
            loc_name = loc_tuple[0]
            u_age = random.choice([8, 12, 16, 25, 65, 75])
            bg, fg = random.choice(colors)
            u_photo_svg = generate_svg_avatar(f"Unidentified-{i}", bg, fg)
            u_name = None
            u_details = "Found disoriented near transit hub. Wearing casual shirt."

        u_person = UnidentifiedPerson(
            photo_url=u_photo_svg,
            location=loc_name,
            latitude=lat,
            longitude=lng,
            uploader_phone=f"+91 91234 {50000 + i}",
            name=u_name,
            approximate_age=u_age,
            native_location="Vijayawada Region",
            additional_details=u_details,
            status="UNIDENTIFIED",
            created_by=ngo_user.id
        )
        db.add(u_person)
        created_unidentified_records.append(u_person)

    db.commit()

    # 4. Generate Embeddings & Potential Matches for Seed Data
    print("Generating feature embeddings and pre-computing match pairs...")
    for missing, bg, fg in created_missing_records:
        emb_list = extract_image_embedding(missing.photo_url)
        db.add(ImageEmbedding(
            person_type="missing",
            person_id=missing.id,
            embedding_json=json.dumps(emb_list)
        ))
        
    for unidentified in created_unidentified_records:
        emb_list = extract_image_embedding(unidentified.photo_url)
        db.add(ImageEmbedding(
            person_type="unidentified",
            person_id=unidentified.id,
            embedding_json=json.dumps(emb_list)
        ))

    db.commit()

    # Link initial guaranteed match pairs
    for i in range(len(matching_pairs_data)):
        m_rec = created_missing_records[i][0]
        u_rec = created_unidentified_records[i]
        
        match_rec = PotentialMatch(
            missing_person_id=m_rec.id,
            unidentified_person_id=u_rec.id,
            visual_score=0.92,
            metadata_score=0.88,
            overall_score=0.90,
            status=MatchStatus.PENDING_VERIFICATION,
            notes="Strong candidate match detected across visual features and age/location compatibility."
        )
        db.add(match_rec)

    # 5. Create System Notifications & Audit Logs
    db.add(Notification(
        user_role="POLICE",
        title="Expo Demo Dataset Loaded",
        message="System initialized with 60 active missing cases, 40 unidentified records, and 8 candidate matches.",
        type="SYSTEM"
    ))
    db.add(AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="SEED_DATABASE",
        entity_type="SYSTEM",
        details="Initialized synthetic demo dataset for Agentic AI Expo."
    ))

    db.commit()
    print("Database seeding completed successfully.")
