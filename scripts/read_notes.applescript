-- read_notes.applescript
-- 보안: 읽기 전용. delete 명령 없음.

tell application "Notes"
	set output to ""
	repeat with aNote in every note
		set noteFolder to ""
		try
			set noteFolder to name of container of aNote
		end try
		set output to output & "ID:" & (id of aNote) & "|||TITLE:" & (name of aNote) & "|||FOLDER:" & noteFolder & "|||BODY:" & (plaintext of aNote) & return & "---NOTE_END---" & return
	end repeat
	return output
end tell
