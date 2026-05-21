// src/components/forms/UploadForm.jsx
import React, { useState, useRef } from "react";
import { MdCloudUpload, MdPictureAsPdf, MdClose } from "react-icons/md";
import { aiService } from "../../services/aiService";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { bytesToSize } from "../../utils/helperFunctions";

const UploadForm = ({ onSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === "application/pdf" || f.type === "text/plain")) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
    } else {
      toast.error("Only PDF and text files are supported");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error("Please select a file"); return; }
    if (!title.trim()) { toast.error("Please enter a title"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("subject", subject);
      formData.append("tags", tags);

      const { data } = await aiService.uploadNote(formData);
      if (data.success) {
        toast.success("File uploaded! Processing in background...");
        onSuccess?.(data.note);
        onClose?.();
      }
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Drop zone */}
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-brand-500 bg-brand-500/10"
              : "border-white/15 hover:border-white/30 hover:bg-white/3"
          }`}
        >
          <MdCloudUpload size={36} className="mx-auto text-slate-500 mb-3" />
          <p className="text-sm font-medium text-slate-300">Drop your file here</p>
          <p className="text-xs text-slate-500 mt-1">PDF or TXT · Max 10MB</p>
          <input ref={inputRef} type="file" accept=".pdf,.txt" onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
            <MdPictureAsPdf size={20} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
            <p className="text-xs text-slate-500">{bytesToSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300"
          >
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document title"
          required
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-all"
        />
      </div>

      {/* Subject */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-brand-500/60 transition-all"
          >
            {["General", "Mathematics", "Science", "History", "Literature", "Programming", "Language", "Other"].map((s) => (
              <option key={s} value={s} className="bg-surface-800">{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tags</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        {onClose && (
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} fullWidth variant="gradient" disabled={!file}>
          {loading ? "Uploading..." : "Upload & Process"}
        </Button>
      </div>
    </form>
  );
};

export default UploadForm;
