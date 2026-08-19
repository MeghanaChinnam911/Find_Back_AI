import re
import json
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.agents.tools import (
    tool_search_missing_cases,
    tool_get_case_statistics,
    tool_get_area_statistics,
    tool_get_potential_matches
)
from app.schemas.schemas import MissingPersonResponse, AgentQueryResponse

class AgentOrchestrator:
    def __init__(self):
        pass

    def process_query(self, db: Session, query_text: str) -> AgentQueryResponse:
        """
        Parses intent from query text, executes structured database tools,
        updates geospatial map parameters, and generates summary explanation.
        """
        query_lower = query_text.lower()
        extracted_params = {}
        tool_calls_executed = []
        
        # 1. Extract Age range parameters
        age_min, age_max = None, None
        if "child" in query_lower or "children" in query_lower or "kid" in query_lower:
            age_min, age_max = 0, 17
            extracted_params["age_category"] = "Children (< 18)"
        elif "elderly" in query_lower or "senior" in query_lower or "old" in query_lower:
            age_min, age_max = 60, 120
            extracted_params["age_category"] = "Elderly (60+)"
        elif "adult" in query_lower:
            age_min, age_max = 18, 59
            extracted_params["age_category"] = "Adults (18-59)"
            
        # Check explicit age patterns like "between 8 and 15", "8 to 14", "aged 10"
        age_between_match = re.search(r'(?:between|from)?\s*(\d{1,2})\s*(?:and|to|-)\s*(\d{1,2})', query_lower)
        if age_between_match:
            age_min = int(age_between_match.group(1))
            age_max = int(age_between_match.group(2))
            extracted_params["age_min"] = age_min
            extracted_params["age_max"] = age_max
            
        # 2. Extract Location parameters
        locations_list = [
            "vijayawada", "hyderabad", "visakhapatnam", "guntur", 
            "tupati", "tirupati", "kakinada", "warangal", "bengaluru", "chennai"
        ]
        detected_location = None
        for loc in locations_list:
            if loc in query_lower:
                detected_location = loc.capitalize()
                extracted_params["location"] = detected_location
                break
                
        # 3. Detect Intent Category
        is_stats_query = any(k in query_lower for k in ["how many", "statistics", "summary", "count", "high risk", "red zone", "total"])
        is_match_query = any(k in query_lower for k in ["match", "potential", "verification", "unidentified"])
        
        # Execute tool calls
        tool_calls_executed.append({
            "tool_name": "search_missing_cases",
            "args": {
                "age_min": age_min,
                "age_max": age_max,
                "location": detected_location,
                "status": "ACTIVE"
            }
        })
        
        cases = tool_search_missing_cases(
            db, 
            age_min=age_min, 
            age_max=age_max, 
            location=detected_location,
            status="ACTIVE"
        )
        
        tool_calls_executed.append({"tool_name": "get_case_statistics", "args": {}})
        stats = tool_get_case_statistics(db)
        
        tool_calls_executed.append({"tool_name": "get_area_statistics", "args": {}})
        area_stats = tool_get_area_statistics(db)
        
        # Map Action Config
        map_action = {
            "center": [16.5062, 80.6480] if not detected_location else self._get_location_coords(detected_location),
            "zoom": 12 if detected_location else 7,
            "highlight_count": len(cases),
            "filter_location": detected_location
        }
        
        # Construct summary response text
        answer_lines = []
        if is_match_query:
            matches = tool_get_potential_matches(db)
            answer_lines.append(f"🔍 **Potential Match Search Completed**")
            answer_lines.append(f"Found {len(matches)} potential match candidates requiring human verification.")
        elif is_stats_query:
            answer_lines.append(f"📊 **System Intelligence Statistics**")
            answer_lines.append(f"• Active Missing Cases: **{stats['active_missing']}**")
            answer_lines.append(f"• Pending Verification Matches: **{stats['pending_matches']}**")
            answer_lines.append(f"• Children (<18): **{stats['age_distribution']['children']}** | Adults: **{stats['age_distribution']['adults']}** | Elderly: **{stats['age_distribution']['elderly']}**")
            if area_stats:
                top_red = [a for a in area_stats if a["risk_level"] == "RED"]
                if top_red:
                    red_str_list = [a["location"] + " (" + str(a["count"]) + " cases)" for a in top_red]
                    answer_lines.append("⚠️ **High-Risk Red Zones**: " + ", ".join(red_str_list))
        else:
            loc_str = f" in **{detected_location}**" if detected_location else ""
            age_str = f" aged **{age_min}-{age_max}**" if (age_min is not None and age_max is not None) else ""
            answer_lines.append(f"🎯 **Autonomous Tool Execution Complete**")
            answer_lines.append(f"Located **{len(cases)} active missing person records** matching criteria{age_str}{loc_str}.")
            answer_lines.append(f"The interactive command map and analytics dashboard have been updated automatically.")
            
        pydantic_cases = [MissingPersonResponse.model_validate(c) for c in cases]
        
        return AgentQueryResponse(
            answer="\n\n".join(answer_lines),
            tool_calls=tool_calls_executed,
            extracted_params=extracted_params,
            filtered_missing_cases=pydantic_cases,
            statistics=stats,
            map_action=map_action
        )

    def _get_location_coords(self, loc_name: str) -> list[float]:
        coords_map = {
            "Vijayawada": [16.5062, 80.6480],
            "Hyderabad": [17.3850, 78.4867],
            "Visakhapatnam": [17.6868, 83.2185],
            "Guntur": [16.3067, 80.4365],
            "Tirupati": [13.6288, 79.4192],
            "Kakinada": [16.9891, 82.2475],
            "Warangal": [17.9689, 79.5941]
        }
        return coords_map.get(loc_name, [16.5062, 80.6480])

agent_orchestrator = AgentOrchestrator()
