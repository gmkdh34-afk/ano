-- read_note_body.applescript
-- 특정 노트 ID의 본문만 읽기
-- 사용법: osascript read_note_body.applescript "note-id"
-- 보안: 읽기 전용. delete 명령 없음.

on run argv
	set noteId to item 1 of argv
	tell application "Notes"
		repeat with aNote in every note
			if (id of aNote) = noteId then
				return plaintext of aNote
			end if
		end repeat
		return ""
	end tell
end run
