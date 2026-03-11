import torch

# In 2026, Intel GPUs use the 'xpu' device name
if torch.xpu.is_available():
    print(f"✅ Intel GPU Detected: {torch.xpu.get_device_name(0)}")
else:
    print("❌ Intel GPU not detected. Check your drivers!")