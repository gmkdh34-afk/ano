-- read_note_ids.applescript
-- ID, 제목, 폴더만 읽기 (본문 제외) - 빠른 스캔용
-- 보안: 읽기 전용. delete 명령 없음.

tell application "Notes"
	set output to ""
	repeat with aNote in every note
		set noteFolder to ""
		try
			set noteFolder to name of container of aNote
		end try
		set output to output & "ID:" & (id of aNote) & "|||TITLE:" & (name of aNote) & "|||FOLDER:" & noteFolder & return & "---NOTE_END---" & return
	end repeat
	return output
end tell
