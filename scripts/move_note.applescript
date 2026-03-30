-- move_note.applescript
-- 보안: 이동만 가능. delete 명령 없음.
-- 사용법: osascript move_note.applescript "note-id" "최상위폴더" ["하위폴더" ...]
-- 예시:   osascript move_note.applescript "x-coredata://..." "00_Work" "02_Business" "01_Marketing"

on run argv
	if (count of argv) < 2 then
		return "ERROR: 인자 부족 — note-id와 최소 폴더명 1개 필요"
	end if

	tell application "Notes"
		-- 최상위 폴더 탐색
		set targetFolder to missing value
		repeat with f in every folder
			if name of f is (item 2 of argv) and class of container of f is not folder then
				set targetFolder to f
				exit repeat
			end if
		end repeat
		if targetFolder is missing value then
			return "ERROR: 최상위 폴더를 찾을 수 없음 - " & item 2 of argv
		end if

		-- 하위 폴더 경로 순서대로 탐색
		repeat with i from 3 to count of argv
			set childFolder to missing value
			repeat with f in folders of targetFolder
				if name of f is (item i of argv) then
					set childFolder to f
					exit repeat
				end if
			end repeat
			if childFolder is missing value then
				return "ERROR: 하위 폴더를 찾을 수 없음 - " & item i of argv
			end if
			set targetFolder to childFolder
		end repeat

		-- ID로 메모 직접 조회
		set targetNote to missing value
		try
			set targetNote to first note whose id is (item 1 of argv)
		end try
		if targetNote is missing value then
			return "ERROR: 메모를 찾을 수 없음 - " & item 1 of argv
		end if

		move targetNote to targetFolder
		return "MOVED:" & name of targetNote & " -> " & name of targetFolder
	end tell
end run
