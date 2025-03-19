try:
    print("Trying to import from pygaze._display.osdisplay...")
    from pygaze._display.osdisplay import OSDisplay
    print("Import successful!")
    
    print("\nCreating an instance of OSDisplay...")
    d = OSDisplay()
    print("Instance created successfully!")
    
except Exception as e:
    print(f"Error: {e}")
    
print("\nTest completed.") 