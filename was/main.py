from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()

# 프론트엔드에서 응답 헤더(Content-Disposition, Level 등)를 읽을 수 있도록 CORS 및 expose_headers 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "X-Final-Output-Level", "X-Initial-Input-Level", "X-LLM-Determined-Level"],
)

# Simple in‑memory placeholder for demonstration. In real code replace with DB / storage lookup.
_job_store = {
    # job_id: {"file_path": "path/to/output.png", "final_output_level": 5, "initial_input_level": 2, "llm_determined_level": 4}
}

def get_job_result(job_id: str):
    """Retrieve job metadata and output file.
    Returns a dict with keys:
        - file_path (str): absolute path to the produced image
        - final_output_level (int|None)
        - initial_input_level (int|None)
        - llm_determined_level (int|None)
    If the job_id is unknown, returns None.
    """
    return _job_store.get(job_id)

@app.get("/download/{job_id}")
async def download(job_id: str):
    """Download the de‑identified image for a given job.

    * If any of ``final_output_level``, ``initial_input_level`` or ``llm_determined_level`` is missing,
      ``None`` is used in its place.
    * The returned filename embeds the ``final_output_level`` value, e.g.
      ``result_lvl5.png``.
    """
    result = get_job_result(job_id)
    if not result:
        return {"error": "Job not found"}

    file_path = Path(result["file_path"]).resolve()
    if not file_path.is_file():
        return {"error": "Result file missing"}

    # Pull the three level values; replace missing ones with None
    final_output_level = result.get("final_output_level")
    initial_input_level = result.get("initial_input_level")
    llm_determined_level = result.get("llm_determined_level")

    # Build a friendly filename that contains the final output level.
    # Example: original name "output.png" -> "output_lvl5.png"
    original_name = file_path.name
    stem, suffix = original_name.rsplit(".", 1) if "." in original_name else (original_name, "")
    level_tag = f"lvl{final_output_level}" if final_output_level is not None else "lvl??"
    download_name = f"{stem}_{level_tag}.{suffix}" if suffix else f"{stem}_{level_tag}"

    # Return the file together with a JSON body that contains the level values.
    # FastAPI can only return one response type, so we embed the levels in HTTP headers.
    headers = {
        "X-Final-Output-Level": str(final_output_level) if final_output_level is not None else "",
        "X-Initial-Input-Level": str(initial_input_level) if initial_input_level is not None else "",
        "X-LLM-Determined-Level": str(llm_determined_level) if llm_determined_level is not None else "",
    }
    return FileResponse(path=file_path, filename=download_name, media_type="application/octet-stream", headers=headers)
